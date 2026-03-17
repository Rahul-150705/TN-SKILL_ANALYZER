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

    @Column(name = "course_name", nullable = false)
    private String courseName;

    @Column(length = 100)
    private String platform;

    @Column(name = "skills_covered", columnDefinition = "JSON")
    private String skillsCovered;

    @Column(name = "course_link", length = 500)
    private String courseLink;
}