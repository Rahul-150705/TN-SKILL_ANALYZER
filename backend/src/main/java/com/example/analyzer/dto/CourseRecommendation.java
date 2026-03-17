package com.example.analyzer.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor
public class CourseRecommendation {
    private String skill;
    private String courseName;
    private String platform;
    private Integer durationWeeks;
    private String courseLink;
}