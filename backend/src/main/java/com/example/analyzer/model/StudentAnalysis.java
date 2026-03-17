package com.example.analyzer.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_analysis")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StudentAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_role_id", nullable = false)
    private JobRole jobRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(name = "resume_text", columnDefinition = "LONGTEXT")
    private String resumeText;

    @Column(name = "match_percentage")
    private Double matchPercentage;

    @Column(name = "matched_skills", columnDefinition = "JSON")
    private String matchedSkills;

    @Column(name = "missing_skills", columnDefinition = "JSON")
    private String missingSkills;

    @Column(name = "partial_skills", columnDefinition = "JSON")
    private String partialSkills;

    @Column(name = "certifications_score")
    private Double certificationsScore;

    @Column(name = "responsiveness_score")
    private Double responsivenessScore;

    @Column(name = "creativity_score")
    private Double creativityScore;

    @Column(name = "technical_skills_score")
    private Double technicalSkillsScore;

    @Column(name = "recommendation_summary", columnDefinition = "TEXT")
    private String recommendationSummary;

    @Column(name = "analyzed_at", updatable = false)
    private LocalDateTime analyzedAt;

    @PrePersist
    protected void onCreate() {
        analyzedAt = LocalDateTime.now();
    }
}