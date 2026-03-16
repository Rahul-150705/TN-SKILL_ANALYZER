package com.example.analyzer.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor
public class CourseRecommendation {
    private String skillName;
    private String courseName;
    private String provider;
    private Integer durationWeeks;
    private String courseUrl;
}