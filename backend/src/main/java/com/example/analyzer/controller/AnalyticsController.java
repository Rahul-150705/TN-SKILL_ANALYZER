package com.example.analyzer.controller;

import com.example.analyzer.dto.RoleAnalyticsReport;
import com.example.analyzer.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/role/{roleId}")
    public ResponseEntity<RoleAnalyticsReport> getRoleAnalytics(@PathVariable Long roleId) {
        return ResponseEntity.ok(analyticsService.getRoleAnalytics(roleId));
    }
}