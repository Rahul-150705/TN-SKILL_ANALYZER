package com.example.analyzer.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
@Data @AllArgsConstructor
public class SkillGapStat {
    private String skillName;
    private Long gapCount;
}