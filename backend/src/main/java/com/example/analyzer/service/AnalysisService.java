package com.example.analyzer.service;

import com.example.analyzer.dto.AnalysisResponse;
import com.example.analyzer.dto.CourseRecommendation;
import com.example.analyzer.model.JobRole;
import com.example.analyzer.model.RequiredSkill;
import com.example.analyzer.model.StudentAnalysis;
import com.example.analyzer.model.User;
import com.example.analyzer.repository.JobRoleRepository;
import com.example.analyzer.repository.StudentAnalysisRepository;
import com.example.analyzer.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalysisService {

    private final ResumeService resumeService;
    private final OllamaService ollamaService;
    private final JobRoleRepository jobRoleRepository;
    private final UserRepository userRepository;
    private final RecommendationService recommendationService;
    private final StudentAnalysisRepository studentAnalysisRepository;
    private final ObjectMapper objectMapper;

    public AnalysisService(UserRepository userRepository,
                           JobRoleRepository jobRoleRepository,
                           StudentAnalysisRepository studentAnalysisRepository,
                           ResumeService resumeService,
                           OllamaService ollamaService,
                           RecommendationService recommendationService,
                           ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.jobRoleRepository = jobRoleRepository;
        this.studentAnalysisRepository = studentAnalysisRepository;
        this.resumeService = resumeService;
        this.ollamaService = ollamaService;
        this.recommendationService = recommendationService;
        this.objectMapper = objectMapper;
    }

    public AnalysisResponse analyze(String studentEmail, Long roleId, MultipartFile resume) {
        User student = userRepository.findByEmail(studentEmail).orElseThrow();
        JobRole role = jobRoleRepository.findById(roleId).orElseThrow();

        // 1. Extract raw text
        String text = resumeService.extractText(resume);

        // 2. Get Required Skills
        List<String> minSkills = role.getRequiredSkills().stream()
                .map(RequiredSkill::getSkillName)
                .collect(Collectors.toList());

        // 3. AI Analysis
        OllamaService.ComprehensiveResult aiOutput = ollamaService.generateComprehensiveAnalysis(
                text, 
                role.getTitle(), 
                role.getBasicRequirements(), 
                role.getDescription(), 
                minSkills
        );

        // 4. Recommendation Engine (Top 3 Courses)
        List<CourseRecommendation> recommendations = recommendationService.getRecommendationsForMissingSkills(aiOutput.missingSkills);

        // 5. Save Analysis
        StudentAnalysis analysis = new StudentAnalysis();
        analysis.setStudent(student);
        analysis.setJobRole(role);
        analysis.setAdmin(role.getAdmin());
        analysis.setResumeText(text);
        analysis.setMatchPercentage((double) aiOutput.matchPercentage);
        
        try {
            analysis.setMatchedSkills(objectMapper.writeValueAsString(aiOutput.matchedSkills));
            analysis.setMissingSkills(objectMapper.writeValueAsString(aiOutput.missingSkills));
            analysis.setPartialSkills(objectMapper.writeValueAsString(aiOutput.partialSkills));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        analysis.setCertificationsScore((double) aiOutput.scores.certifications);
        analysis.setResponsivenessScore((double) aiOutput.scores.responsiveness);
        analysis.setCreativityScore((double) aiOutput.scores.creativity);
        analysis.setTechnicalSkillsScore((double) aiOutput.scores.technicalSkills);
        analysis.setRecommendationSummary(aiOutput.recommendationSummary);
        analysis.setAnalyzedAt(LocalDateTime.now());
        
        StudentAnalysis saved = studentAnalysisRepository.save(analysis);

        return AnalysisResponse.builder()
                .id(saved.getId())
                .studentName(student.getName())
                .jobRoleTitle(role.getTitle())
                .matchedSkills(aiOutput.matchedSkills)
                .missingSkills(aiOutput.missingSkills)
                .partialSkills(aiOutput.partialSkills)
                .matchPercentage((double) aiOutput.matchPercentage)
                .scores(aiOutput.scores)
                .recommendationSummary(aiOutput.recommendationSummary)
                .recommendedCourses(recommendations)
                .analyzedAt(saved.getAnalyzedAt())
                .build();
    }
}