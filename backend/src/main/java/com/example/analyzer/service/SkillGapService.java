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
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Qualifier;
import java.util.concurrent.Executor;

@Service
public class SkillGapService {

    private final ResumeService resumeService;
    private final OllamaService ollamaService;
    private final JobRoleRepository jobRoleRepository;
    private final UserRepository userRepository;
    private final RecommendationService recommendationService;
    private final EmployeeAnalysisRepository employeeAnalysisRepository;
    private final ObjectMapper objectMapper;
    private final Executor analysisTaskExecutor;

    public SkillGapService(UserRepository userRepository,
                           JobRoleRepository jobRoleRepository,
                           EmployeeAnalysisRepository employeeAnalysisRepository,
                           ResumeService resumeService,
                           OllamaService ollamaService,
                           RecommendationService recommendationService,
                           ObjectMapper objectMapper,
                           @Qualifier("analysisTaskExecutor") Executor analysisTaskExecutor) {
        this.userRepository = userRepository;
        this.jobRoleRepository = jobRoleRepository;
        this.employeeAnalysisRepository = employeeAnalysisRepository;
        this.resumeService = resumeService;
        this.ollamaService = ollamaService;
        this.recommendationService = recommendationService;
        this.objectMapper = objectMapper;
        this.analysisTaskExecutor = analysisTaskExecutor;
    }

    public AnalysisResponse analyze(String employeeEmail, Long roleId, MultipartFile resume) {
        User employee = userRepository.findByEmail(employeeEmail).orElseThrow();
        JobRole role = jobRoleRepository.findById(roleId).orElseThrow();

        if (!role.getCompany().getId().equals(employee.getCompany().getId())) {
            throw new RuntimeException("Unauthorized job role access");
        }

        // 1. Extract raw text
        String text = resumeService.extractText(resume);

        // 2. Get Required Skills mapped to names
        List<String> requiredSkillNames = new ArrayList<>();
        if(role.getRequiredSkills() != null) {
            for(RequiredSkill r : role.getRequiredSkills()) {
                requiredSkillNames.add(r.getSkillName());
            }
        }

        // 3. Ask AI for Comprehensive Analysis
        OllamaService.ComprehensiveResult aiOutput = ollamaService.generateComprehensiveAnalysis(text, role.getTitle(), role.getDescription(), requiredSkillNames);

        // 4. Get Recommended Courses for missing/partial skills
        List<String> skillsToLearn = new ArrayList<>();
        if (aiOutput.skillsAnalysis != null) {
            if (aiOutput.skillsAnalysis.missing != null) skillsToLearn.addAll(aiOutput.skillsAnalysis.missing);
            if (aiOutput.skillsAnalysis.partial != null) skillsToLearn.addAll(aiOutput.skillsAnalysis.partial);
        }
        List<CourseRecommendation> recommendations = recommendationService.getRecommendations(skillsToLearn);

        // 5. Save Analysis
        EmployeeAnalysis analysis = new EmployeeAnalysis();
        analysis.setEmployee(employee);
        analysis.setJobRole(role);
        analysis.setResumeText(text);

        try {
            if (aiOutput.skillsAnalysis != null) {
                analysis.setMatchedSkills(objectMapper.writeValueAsString(aiOutput.skillsAnalysis.matched));
                analysis.setMissingSkills(objectMapper.writeValueAsString(aiOutput.skillsAnalysis.missing));
                analysis.setPartialSkills(objectMapper.writeValueAsString(aiOutput.skillsAnalysis.partial));
            }
            if (aiOutput.categoryScores != null) {
                analysis.setCategoryScores(objectMapper.writeValueAsString(aiOutput.categoryScores));
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        analysis.setMatchPercentage((double) aiOutput.overallMatchScore);
        analysis.setMatchCategory(aiOutput.matchCategory);
        analysis.setAssessment(aiOutput.assessment);
        analysis.setRecommendation(aiOutput.recommendation);
        analysis.setAnalyzedAt(LocalDateTime.now());
        EmployeeAnalysis saved = employeeAnalysisRepository.save(analysis);

        return AnalysisResponse.builder()
                .id(saved.getId())
                .employeeName(employee.getName())
                .jobRoleTitle(role.getTitle())
                .matchedSkills(aiOutput.skillsAnalysis != null ? aiOutput.skillsAnalysis.matched : new ArrayList<>())
                .missingSkills(aiOutput.skillsAnalysis != null ? aiOutput.skillsAnalysis.missing : new ArrayList<>())
                .partialSkills(aiOutput.skillsAnalysis != null ? aiOutput.skillsAnalysis.partial : new ArrayList<>())
                .categoryScores(aiOutput.categoryScores)
                .matchPercentage((double) aiOutput.overallMatchScore)
                .matchCategory(aiOutput.matchCategory)
                .assessment(aiOutput.assessment)
                .recommendation(aiOutput.recommendation)
                .recommendedCourses(recommendations)
                .analyzedAt(saved.getAnalyzedAt())
                .build();
    }

    public SseEmitter analyzeStream(String employeeEmail, Long roleId, MultipartFile resume) {
        User employee = userRepository.findByEmail(employeeEmail).orElseThrow();
        JobRole role = jobRoleRepository.findById(roleId).orElseThrow();
        SseEmitter emitter = new SseEmitter(120_000L); // 2 minute timeout

        analysisTaskExecutor.execute(() -> {
            try {
                emitter.send(SseEmitter.event().name("step").data("Extracting text from PDF..."));
                String text = resumeService.extractText(resume);

                emitter.send(SseEmitter.event().name("step").data("AI is analyzing your skills..."));
                
                List<String> requiredSkillNames = new ArrayList<>();
                if(role.getRequiredSkills() != null) {
                    for(RequiredSkill r : role.getRequiredSkills()) {
                        requiredSkillNames.add(r.getSkillName());
                    }
                }

                StringBuilder fullResponse = new StringBuilder();
                ollamaService.streamComprehensiveAnalysis(text, role.getTitle(), role.getDescription(), requiredSkillNames, token -> {
                    try {
                        if (token.equals("[DONE]")) {
                            // Final processing
                            String finalJson = fullResponse.toString();
                            Pattern pattern = Pattern.compile("\\{.*\\}", Pattern.DOTALL);
                            Matcher matcher = pattern.matcher(finalJson);
                            if (matcher.find()) {
                                String cleanJson = matcher.group(0);
                                OllamaService.ComprehensiveResult aiOutput = objectMapper.readValue(cleanJson, OllamaService.ComprehensiveResult.class);
                                
                                // SAVE TO DB (Duplicate logic from analyze)
                                EmployeeAnalysis analysis = new EmployeeAnalysis();
                                analysis.setEmployee(employee);
                                analysis.setJobRole(role);
                                analysis.setResumeText(text);
                                if (aiOutput.skillsAnalysis != null) {
                                    analysis.setMatchedSkills(objectMapper.writeValueAsString(aiOutput.skillsAnalysis.matched));
                                    analysis.setMissingSkills(objectMapper.writeValueAsString(aiOutput.skillsAnalysis.missing));
                                    analysis.setPartialSkills(objectMapper.writeValueAsString(aiOutput.skillsAnalysis.partial));
                                }
                                if (aiOutput.categoryScores != null) {
                                    analysis.setCategoryScores(objectMapper.writeValueAsString(aiOutput.categoryScores));
                                }
                                analysis.setMatchPercentage((double) aiOutput.overallMatchScore);
                                analysis.setMatchCategory(aiOutput.matchCategory);
                                analysis.setAssessment(aiOutput.assessment);
                                analysis.setRecommendation(aiOutput.recommendation);
                                analysis.setAnalyzedAt(LocalDateTime.now());
                                EmployeeAnalysis saved = employeeAnalysisRepository.save(analysis);

                                emitter.send(SseEmitter.event().name("final").data(saved.getId()));
                            }
                            emitter.complete();
                        } else if (token.equals("[ERROR]")) {
                            emitter.completeWithError(new RuntimeException("AI Stream Error"));
                        } else {
                            fullResponse.append(token);
                            emitter.send(SseEmitter.event().name("token").data(token));
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });

            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

}