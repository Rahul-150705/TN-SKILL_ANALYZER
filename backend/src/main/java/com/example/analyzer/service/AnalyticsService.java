package com.example.analyzer.service;

import com.example.analyzer.dto.RoleAnalyticsReport;
import com.example.analyzer.model.JobRole;
import com.example.analyzer.model.StudentAnalysis;
import com.example.analyzer.repository.JobRoleRepository;
import com.example.analyzer.repository.StudentAnalysisRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final StudentAnalysisRepository analysisRepository;
    private final JobRoleRepository jobRoleRepository;
    private final RecommendationService recommendationService;
    private final ObjectMapper objectMapper;

    public AnalyticsService(StudentAnalysisRepository analysisRepository,
                            JobRoleRepository jobRoleRepository,
                            RecommendationService recommendationService,
                            ObjectMapper objectMapper) {
        this.analysisRepository = analysisRepository;
        this.jobRoleRepository = jobRoleRepository;
        this.recommendationService = recommendationService;
        this.objectMapper = objectMapper;
    }

    public RoleAnalyticsReport getRoleAnalytics(Long roleId) {
        JobRole role = jobRoleRepository.findById(roleId).orElseThrow();
        List<StudentAnalysis> analyses = analysisRepository.findByJobRole_Id(roleId);

        List<RoleAnalyticsReport.StudentScoreDTO> studentScores = analyses.stream().map(a -> {
            OllamaService.Scores catScores = new OllamaService.Scores();
            catScores.certifications = a.getCertificationsScore().intValue();
            catScores.responsiveness = a.getResponsivenessScore().intValue();
            catScores.creativity = a.getCreativityScore().intValue();
            catScores.technicalSkills = a.getTechnicalSkillsScore().intValue();

            return RoleAnalyticsReport.StudentScoreDTO.builder()
                    .studentName(a.getStudent().getName())
                    .matchPercentage(a.getMatchPercentage())
                    .categoryScores(catScores)
                    .build();
        }).collect(Collectors.toList());

        long needsImprovement = analyses.stream().filter(a -> a.getMatchPercentage() < 60).count();

        // Aggregate missing skills
        Map<String, Integer> missingSkillFreq = new HashMap<>();
        for (StudentAnalysis a : analyses) {
            try {
                List<String> missing = objectMapper.readValue(a.getMissingSkills(), new TypeReference<List<String>>() {});
                for (String s : missing) {
                    missingSkillFreq.put(s, missingSkillFreq.getOrDefault(s, 0) + 1);
                }
            } catch (Exception ignored) {}
        }

        List<String> aggregatedMissing = missingSkillFreq.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(10)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        return RoleAnalyticsReport.builder()
                .roleId(role.getId())
                .roleTitle(role.getTitle())
                .totalStudents(analyses.size())
                .studentScores(studentScores)
                .studentsNeedingImprovement(needsImprovement)
                .aggregatedMissingSkills(aggregatedMissing)
                .topRecommendedCourses(recommendationService.getRecommendationsForMissingSkills(aggregatedMissing))
                .build();
    }
}