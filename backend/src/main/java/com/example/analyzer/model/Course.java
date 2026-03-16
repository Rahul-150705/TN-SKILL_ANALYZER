package com.example.analyzer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courses")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_name", nullable = false)
    private String skillName;

    @Column(name = "course_name", nullable = false)
    private String courseName;

    @Column(length = 100)
    private String provider;

    @Column(name = "duration_weeks")
    private Integer durationWeeks;

    @Column(name = "course_url", length = 500)
    private String courseUrl;
}