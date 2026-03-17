package com.example.analyzer.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import com.example.analyzer.service.OllamaService;

@Data @Builder
public class AnalysisResponse {
    private Long id;
    private String studentName;
    private String jobRoleTitle;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> partialSkills;
    private Double matchPercentage;
    private OllamaService.Scores scores;
    private String recommendationSummary;
    private List<CourseRecommendation> recommendedCourses;
    private LocalDateTime analyzedAt;
}