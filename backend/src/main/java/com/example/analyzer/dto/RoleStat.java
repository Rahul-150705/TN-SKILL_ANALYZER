package com.example.analyzer.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
@Data @AllArgsConstructor
public class RoleStat {
    private String roleTitle;
    private Double averageMatchPercentage;
}