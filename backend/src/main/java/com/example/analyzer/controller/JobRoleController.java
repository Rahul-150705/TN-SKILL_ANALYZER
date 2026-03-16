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
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<JobRoleResponse> createRole(@RequestBody JobRoleRequest request, Authentication auth) {
        return ResponseEntity.ok(jobRoleService.createRole(request, auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<List<JobRoleResponse>> getRolesForCompany(Authentication auth) {
        return ResponseEntity.ok(jobRoleService.getRolesForCompany(auth.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<JobRoleResponse> getRole(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(jobRoleService.getRole(id, auth.getName()));
    }

    @GetMapping("/hr/{hrId}")
    @PreAuthorize("hasAnyRole('HR', 'EMPLOYEE')")
    public ResponseEntity<List<JobRoleResponse>> getRolesByHrId(@PathVariable Long hrId) {
        return ResponseEntity.ok(jobRoleService.getRolesByHrId(hrId));
    }

    @GetMapping("/code/{uniqueId}")
    @PreAuthorize("hasAnyRole('HR', 'EMPLOYEE')")
    public ResponseEntity<JobRoleResponse> getRoleByUniqueId(@PathVariable String uniqueId) {
        return ResponseEntity.ok(jobRoleService.getRoleByUniqueId(uniqueId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<?> deleteRole(@PathVariable Long id, Authentication auth) {
        jobRoleService.deleteRole(id, auth.getName());
        return ResponseEntity.ok().build();
    }
}