package com.example.analyzer.controller;

import com.example.analyzer.dto.JobRoleRequest;
import com.example.analyzer.dto.JobRoleResponse;
import com.example.analyzer.service.JobRoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@PreAuthorize("hasRole('HR')")
public class JobRoleController {

    private final JobRoleService jobRoleService;

    public JobRoleController(JobRoleService jobRoleService) {
        this.jobRoleService = jobRoleService;
    }

    @PostMapping
    public ResponseEntity<JobRoleResponse> createRole(@RequestBody JobRoleRequest request, Authentication auth) {
        return ResponseEntity.ok(jobRoleService.createRole(request, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<JobRoleResponse>> getRolesForCompany(Authentication auth) {
        return ResponseEntity.ok(jobRoleService.getRolesForCompany(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobRoleResponse> getRole(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(jobRoleService.getRole(id, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRole(@PathVariable Long id, Authentication auth) {
        jobRoleService.deleteRole(id, auth.getName());
        return ResponseEntity.ok().build();
    }
}