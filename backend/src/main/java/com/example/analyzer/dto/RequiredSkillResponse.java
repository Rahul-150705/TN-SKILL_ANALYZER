package com.example.analyzer.dto;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.example.analyzer.model.RequiredSkill;

@Data @AllArgsConstructor @NoArgsConstructor
public class RequiredSkillResponse {
    private Long id;
    private String skillName;
    private String skillCategory;

    public static RequiredSkillResponse fromEntity(RequiredSkill rs) {
        return new RequiredSkillResponse(rs.getId(), rs.getSkillName(), rs.getSkillCategory());
    }
}