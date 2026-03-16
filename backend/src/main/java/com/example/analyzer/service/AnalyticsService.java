package com.example.analyzer.service;

import com.example.analyzer.dto.RoleStat;
import com.example.analyzer.dto.SkillGapStat;
import com.example.analyzer.dto.TrendPoint;
import com.example.analyzer.dto.WorkforceAnalyticsResponse;
import com.example.analyzer.model.EmployeeAnalysis;
import com.example.analyzer.repository.EmployeeAnalysisRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final EmployeeAnalysisRepository analysisRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AnalyticsService(EmployeeAnalysisRepository analysisRepository) {
        this.analysisRepository = analysisRepository;
    }

    public WorkforceAnalyticsResponse getWorkforceAnalytics(Long companyId) {
        List<EmployeeAnalysis> analyses = analysisRepository.findByEmployeeCompanyId(companyId);

        long totalAnalyzed = analyses.size();
        if (totalAnalyzed == 0) {
            return WorkforceAnalyticsResponse.builder()
                    .totalAnalyzed(0L).evReadyCount(0L).needsTrainingCount(0L)
                    .averageMatchPercentage(0.0).evReadinessScore(0.0)
                    .topSkillGaps(new ArrayList<>()).roleBreakdown(new ArrayList<>()).weeklyTrend(new ArrayList<>())
                    .build();
        }

        long evReadyCount = analyses.stream().filter(a -> a.getMatchPercentage() >= 70).count();
        long needsTrainingCount = totalAnalyzed - evReadyCount;
        double avgMatchPct = analyses.stream().mapToDouble(EmployeeAnalysis::getMatchPercentage).average().orElse(0);
        double evReadinessScore = ((double) evReadyCount / totalAnalyzed) * 100.0;

        // Skill Gaps
        Map<String, Long> skillGapCount = new HashMap<>();
        for (EmployeeAnalysis a : analyses) {
            try {
                if(a.getMissingSkills() != null && !a.getMissingSkills().equals("[]")) {
                   List<String> missing = objectMapper.readValue(a.getMissingSkills(), new TypeReference<List<String>>() {});
                   for (String skill : missing) {
                       skillGapCount.put(skill, skillGapCount.getOrDefault(skill, 0L) + 1);
                   }
                }
            } catch (Exception ignored) {}
        }

        List<SkillGapStat> topSkillGaps = skillGapCount.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(5)
                .map(e -> new SkillGapStat(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // Role Breakdown
        Map<String, List<Double>> roleScores = new HashMap<>();
        for (EmployeeAnalysis a : analyses) {
            String roleName = a.getJobRole().getTitle();
            roleScores.computeIfAbsent(roleName, k -> new ArrayList<>()).add(a.getMatchPercentage());
        }

        List<RoleStat> roleBreakdown = roleScores.entrySet().stream()
                .map(e -> {
                    double avg = e.getValue().stream().mapToDouble(v -> v).average().orElse(0);
                    return new RoleStat(e.getKey(), avg);
                })
                .sorted((r1, r2) -> Double.compare(r2.getAverageMatchPercentage(), r1.getAverageMatchPercentage()))
                .collect(Collectors.toList());

        // Weekly Trend
        Map<String, List<Double>> weeklyScores = new TreeMap<>(); // ordered map
        WeekFields weekFields = WeekFields.ISO;
        for (EmployeeAnalysis a : analyses) {
            int year = a.getAnalyzedAt().getYear();
            int week = a.getAnalyzedAt().get(weekFields.weekOfWeekBasedYear());
            String weekLabel = "W" + week + " " + year;
            weeklyScores.computeIfAbsent(weekLabel, k -> new ArrayList<>()).add(a.getMatchPercentage());
        }

        List<TrendPoint> weeklyTrend = weeklyScores.entrySet().stream()
                .map(e -> {
                    double avg = e.getValue().stream().mapToDouble(v -> v).average().orElse(0);
                    return new TrendPoint(e.getKey(), avg, (long) e.getValue().size());
                })
                .collect(Collectors.toList());

        return WorkforceAnalyticsResponse.builder()
                .totalAnalyzed(totalAnalyzed)
                .evReadyCount(evReadyCount)
                .needsTrainingCount(needsTrainingCount)
                .averageMatchPercentage(Math.round(avgMatchPct * 10.0) / 10.0)
                .evReadinessScore(Math.round(evReadinessScore * 10.0) / 10.0)
                .topSkillGaps(topSkillGaps)
                .roleBreakdown(roleBreakdown)
                .weeklyTrend(weeklyTrend)
                .build();
    }
}