package com.example.analyzer.service;

import com.example.analyzer.dto.CourseRecommendation;
import com.example.analyzer.model.Course;
import com.example.analyzer.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RecommendationService {

    private final CourseRepository courseRepository;

    public RecommendationService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<CourseRecommendation> getRecommendations(List<String> missingSkills) {
        List<CourseRecommendation> recs = new ArrayList<>();
        for (String missingSkill : missingSkills) {
            List<Course> courses = courseRepository.findBySkillNameContainingIgnoreCase(missingSkill);
            if (!courses.isEmpty()) {
                Course c = courses.get(0); // Take top 1
                recs.add(new CourseRecommendation(c.getSkillName(), c.getCourseName(), c.getProvider(), c.getDurationWeeks(), c.getCourseUrl()));
            } else {
                 // Fallback generic search
                 String[] words = missingSkill.split(" ");
                 if(words.length > 0) {
                     List<Course> fallback = courseRepository.findBySkillNameContainingIgnoreCase(words[0]);
                     if (!fallback.isEmpty()) {
                         Course c = fallback.get(0);
                         recs.add(new CourseRecommendation(c.getSkillName(), c.getCourseName(), c.getProvider(), c.getDurationWeeks(), c.getCourseUrl()));
                     }
                 }
            }
        }
        return recs;
    }
}