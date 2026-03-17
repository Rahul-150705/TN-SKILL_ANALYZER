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
public class JobRoleController {

    private final JobRoleService jobRoleService;

    public JobRoleController(JobRoleService jobRoleService) {
        this.jobRoleService = jobRoleService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<JobRoleResponse> createRole(@RequestBody JobRoleRequest request, Authentication auth) {
        request.validate();
        return ResponseEntity.ok(jobRoleService.createRole(request, auth.getName()));
    }

    @GetMapping("/admin/me")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<JobRoleResponse>> getAdminRoles(Authentication auth) {
        return ResponseEntity.ok(jobRoleService.getAdminRoles(auth.getName()));
    }

    @GetMapping("/student/{adminCode}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<JobRoleResponse>> getRolesByAdminCode(@PathVariable String adminCode) {
        return ResponseEntity.ok(jobRoleService.getRolesByAdminCode(adminCode));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<JobRoleResponse> getRole(@PathVariable Long id) {
        return ResponseEntity.ok(jobRoleService.getRole(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRole(@PathVariable Long id, Authentication auth) {
        jobRoleService.deleteRole(id, auth.getName());
        return ResponseEntity.ok().build();
    }
}