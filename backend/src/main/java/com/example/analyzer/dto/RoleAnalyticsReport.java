package com.example.analyzer.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import com.example.analyzer.service.OllamaService;

@Data @Builder
public class RoleAnalyticsReport {
    private Long roleId;
    private String roleTitle;
    private int totalStudents;
    private List<StudentScoreDTO> studentScores;
    private long studentsNeedingImprovement;
    private List<String> aggregatedMissingSkills;
    private List<CourseRecommendation> topRecommendedCourses;

    @Data @Builder
    public static class StudentScoreDTO {
        private String studentName;
        private Double matchPercentage;
        private OllamaService.Scores categoryScores;
    }
}
