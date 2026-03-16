package com.example.analyzer.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_skill_analysis")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_role_id", nullable = false)
    private JobRole jobRole;

    @Column(name = "resume_text", columnDefinition = "LONGTEXT")
    private String resumeText;

    @Column(name = "detected_skills", columnDefinition = "JSON")
    private String detectedSkills;

    @Column(name = "missing_skills", columnDefinition = "JSON")
    private String missingSkills;

    @Column(name = "matched_skills", columnDefinition = "JSON")
    private String matchedSkills;

    @Column(name = "partial_skills", columnDefinition = "JSON")
    private String partialSkills;

    @Column(name = "category_scores", columnDefinition = "JSON")
    private String categoryScores;

    @Column(name = "assessment", columnDefinition = "TEXT")
    private String assessment;

    @Column(name = "recommendation", columnDefinition = "TEXT")
    private String recommendation;

    @Column(name = "match_category")
    private String matchCategory;

    @Column(name = "match_percentage")
    private Double matchPercentage;

    @Column(name = "analyzed_at", updatable = false)
    private LocalDateTime analyzedAt;

    @PrePersist
    protected void onCreate() {
        analyzedAt = LocalDateTime.now();
    }
}