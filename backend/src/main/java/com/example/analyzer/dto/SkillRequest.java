package com.example.analyzer.dto;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
@Data @AllArgsConstructor @NoArgsConstructor
public class SkillRequest {
    private String skillName;
    private String skillCategory;
}