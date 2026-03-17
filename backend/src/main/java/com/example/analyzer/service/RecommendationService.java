package com.example.analyzer.service;

import com.example.analyzer.dto.CourseRecommendation;
import com.example.analyzer.model.Course;
import com.example.analyzer.repository.CourseRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final CourseRepository courseRepository;
    private final ObjectMapper objectMapper;

    public RecommendationService(CourseRepository courseRepository, ObjectMapper objectMapper) {
        this.courseRepository = courseRepository;
        this.objectMapper = objectMapper;
    }

    public List<CourseRecommendation> getRecommendationsForMissingSkills(List<String> missingSkills) {
        if (missingSkills == null || missingSkills.isEmpty()) return new ArrayList<>();

        List<Course> allCourses = courseRepository.findAll();
        Map<Course, Integer> courseMatchCount = new HashMap<>();

        for (Course course : allCourses) {
            int matches = 0;
            List<String> coveredSkills = new ArrayList<>();
            try {
                coveredSkills = objectMapper.readValue(course.getSkillsCovered(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                // handle or ignore
            }

            for (String missingSkill : missingSkills) {
                for (String covered : coveredSkills) {
                    if (covered.toLowerCase().contains(missingSkill.toLowerCase()) || 
                        missingSkill.toLowerCase().contains(covered.toLowerCase())) {
                        matches++;
                        break;
                    }
                }
            }
            if (matches > 0) {
                courseMatchCount.put(course, matches);
            }
        }

        return courseMatchCount.entrySet().stream()
                .sorted(Map.Entry.<Course, Integer>comparingByValue().reversed())
                .limit(3)
                .map(entry -> {
                    Course c = entry.getKey();
                    return new CourseRecommendation(null, c.getCourseName(), c.getPlatform(), null, c.getCourseLink());
                })
                .collect(Collectors.toList());
    }
}