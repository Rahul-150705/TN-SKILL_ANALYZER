package com.example.analyzer.controller;

import com.example.analyzer.dto.WorkforceAnalyticsResponse;
import com.example.analyzer.model.User;
import com.example.analyzer.repository.UserRepository;
import com.example.analyzer.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasRole('HR')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;

    public AnalyticsController(AnalyticsService analyticsService, UserRepository userRepository) {
        this.analyticsService = analyticsService;
        this.userRepository = userRepository;
    }

    @GetMapping("/workforce")
    public ResponseEntity<WorkforceAnalyticsResponse> getWorkforceAnalytics(Authentication auth) {
        User hr = userRepository.findByEmail(auth.getName()).orElseThrow();
        Long companyId = hr.getCompany() != null ? hr.getCompany().getId() : null;
        if(companyId == null) return ResponseEntity.ok(WorkforceAnalyticsResponse.builder().build());
        return ResponseEntity.ok(analyticsService.getWorkforceAnalytics(companyId));
    }
}