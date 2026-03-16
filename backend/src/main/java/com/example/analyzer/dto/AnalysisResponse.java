package com.example.analyzer.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class AnalysisResponse {
    private Long id;
    private String employeeName;
    private String jobRoleTitle;
    private List<String> detectedSkills;
    private List<String> missingSkills;
    private List<String> matchedSkills;
    private List<String> partialSkills;
    private Double matchPercentage;
    private String matchCategory;
    private java.util.Map<String, Integer> categoryScores;
    private String assessment;
    private String recommendation;
    private List<CourseRecommendation> recommendedCourses;
    private LocalDateTime analyzedAt;
}