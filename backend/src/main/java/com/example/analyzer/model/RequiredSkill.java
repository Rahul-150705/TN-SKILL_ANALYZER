package com.example.analyzer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "required_skills")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RequiredSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_name", nullable = false)
    private String skillName;

    @Column(name = "skill_category", length = 100)
    private String skillCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_role_id", nullable = false)
    private JobRole jobRole;
}