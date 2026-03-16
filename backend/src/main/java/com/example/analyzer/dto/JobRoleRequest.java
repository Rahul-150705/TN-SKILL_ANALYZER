package com.example.analyzer.dto;
import lombok.Data;
import java.util.List;
@Data
public class JobRoleRequest {
    private String title;
    private String description;
    private List<SkillRequest> requiredSkills;
}