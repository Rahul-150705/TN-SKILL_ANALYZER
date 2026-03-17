package com.example.analyzer.dto;
import lombok.Data;
import java.util.List;
@Data
public class JobRoleRequest {
    private String title;
    private String basicRequirements;
    private String description;
    private List<SkillRequest> minSkills;

    public void validate() {
        if (minSkills == null || minSkills.size() < 3) {
            throw new RuntimeException("At least 3 skills are required");
        }
    }
}