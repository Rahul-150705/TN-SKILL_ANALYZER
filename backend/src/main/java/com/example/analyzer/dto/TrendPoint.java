package com.example.analyzer.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
@Data @AllArgsConstructor
public class TrendPoint {
    private String weekLabel;
    private Double averageMatchPercentage;
    private Long totalAnalyzed;
}