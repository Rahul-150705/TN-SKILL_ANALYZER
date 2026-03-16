package com.example.analyzer.dto;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class WorkforceAnalyticsResponse {
    private Long totalAnalyzed;
    private Long evReadyCount;
    private Long needsTrainingCount;
    private Double averageMatchPercentage;
    private Double evReadinessScore;
    private List<SkillGapStat> topSkillGaps;
    private List<RoleStat> roleBreakdown;
    private List<TrendPoint> weeklyTrend;
}