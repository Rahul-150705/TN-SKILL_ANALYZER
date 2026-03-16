package com.example.analyzer.service;

import com.example.analyzer.dto.AnalysisResponse;
import com.example.analyzer.dto.CourseRecommendation;
import com.example.analyzer.model.EmployeeAnalysis;
import com.example.analyzer.model.JobRole;
import com.example.analyzer.model.RequiredSkill;
import com.example.analyzer.model.User;
import com.example.analyzer.repository.EmployeeAnalysisRepository;
import com.example.analyzer.repository.JobRoleRepository;
import com.example.analyzer.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SkillGapService {

    private final ResumeService resumeService;
    private final OllamaService ollamaService;
    private final JobRoleRepository jobRoleRepository;
    private final UserRepository userRepository;
    private final RecommendationService recommendationService;
    private final EmployeeAnalysisRepository employeeAnalysisRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SkillGapService(ResumeService resumeService, OllamaService ollamaService,
                           JobRoleRepository jobRoleRepository, UserRepository userRepository,
                           RecommendationService recommendationService,
                           EmployeeAnalysisRepository employeeAnalysisRepository) {
        this.resumeService = resumeService;
        this.ollamaService = ollamaService;
        this.jobRoleRepository = jobRoleRepository;
        this.userRepository = userRepository;
        this.recommendationService = recommendationService;
        this.employeeAnalysisRepository = employeeAnalysisRepository;
    }

    public AnalysisResponse analyze(String employeeEmail, Long roleId, MultipartFile resume) {
        User employee = userRepository.findByEmail(employeeEmail).orElseThrow();
        JobRole role = jobRoleRepository.findById(roleId).orElseThrow();

        if (!role.getCompany().getId().equals(employee.getCompany().getId())) {
            throw new RuntimeException("Unauthorized job role access");
        }

        // 1 & 2. Extract Skills
        String text = resumeService.extractText(resume);
        List<String> detectedSkills = ollamaService.extractSkills(text);
        if(detectedSkills == null) detectedSkills = new ArrayList<>();

        // 3. Get Required Skills
        List<RequiredSkill> requiredSkills = role.getRequiredSkills();
        if(requiredSkills == null) requiredSkills = new ArrayList<>();

        // 4. Compare
        SkillMatchResult result = compareSkills(detectedSkills, requiredSkills);

        // 5 & 6. Course Recs
        List<CourseRecommendation> recommendations = recommendationService.getRecommendations(result.missing);

        // 7. Save Analysis
        EmployeeAnalysis analysis = new EmployeeAnalysis();
        analysis.setEmployee(employee);
        analysis.setJobRole(role);
        analysis.setResumeText(text);
        
        try {
            analysis.setDetectedSkills(objectMapper.writeValueAsString(detectedSkills));
            analysis.setMissingSkills(objectMapper.writeValueAsString(result.missing));
            analysis.setMatchedSkills(objectMapper.writeValueAsString(result.matched));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            analysis.setDetectedSkills("[]");
            analysis.setMissingSkills("[]");
            analysis.setMatchedSkills("[]");
        }
        
        analysis.setMatchPercentage(result.matchPct);
        analysis.setAnalyzedAt(LocalDateTime.now());
        EmployeeAnalysis saved = employeeAnalysisRepository.save(analysis);

        return AnalysisResponse.builder()
                .id(saved.getId())
                .employeeName(employee.getName())
                .jobRoleTitle(role.getTitle())
                .detectedSkills(detectedSkills)
                .missingSkills(result.missing)
                .matchedSkills(result.matched)
                .matchPercentage(result.matchPct)
                .recommendedCourses(recommendations)
                .analyzedAt(saved.getAnalyzedAt())
                .build();
    }

    private SkillMatchResult compareSkills(List<String> detectedSkills, List<RequiredSkill> requiredSkills) {
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (RequiredSkill required : requiredSkills) {
            boolean isMatched = false;
            String reqNorm = normalize(required.getSkillName());

            for (String detected : detectedSkills) {
                String detNorm = normalize(detected);

                // Rule 1: Exact match (normalized)
                if (reqNorm.equals(detNorm)) { isMatched = true; break; }

                // Rule 2: Contains match (one contains the other)
                if (reqNorm.contains(detNorm) || detNorm.contains(reqNorm)) {
                    isMatched = true; break;
                }

                // Rule 3: Keyword overlap (split into words, check common words)
                Set<String> reqWords = new HashSet<>(Arrays.asList(reqNorm.split(" ")));
                Set<String> detWords = new HashSet<>(Arrays.asList(detNorm.split(" ")));
                reqWords.retainAll(detWords);
                if (reqWords.size() >= 1 && reqWords.stream().noneMatch(w -> w.length() <= 2)) {
                    isMatched = true; break;
                }
            }

            if (isMatched) matched.add(required.getSkillName());
            else missing.add(required.getSkillName());
        }

        double matchPct = requiredSkills.isEmpty() ? 0 : (matched.size() * 100.0) / requiredSkills.size();
        return new SkillMatchResult(matched, missing, matchPct);
    }

    private String normalize(String skill) {
        return skill.toLowerCase().replaceAll("[^a-z0-9 ]", "").trim();
    }

    private static class SkillMatchResult {
        List<String> matched;
        List<String> missing;
        double matchPct;

        public SkillMatchResult(List<String> matched, List<String> missing, double matchPct) {
            this.matched = matched;
            this.missing = missing;
            this.matchPct = matchPct;
        }
    }
}