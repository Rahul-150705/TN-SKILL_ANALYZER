package com.example.analyzer.service;

import com.example.analyzer.dto.JobRoleRequest;
import com.example.analyzer.dto.JobRoleResponse;
import com.example.analyzer.model.JobRole;
import com.example.analyzer.model.RequiredSkill;
import com.example.analyzer.model.User;
import com.example.analyzer.repository.JobRoleRepository;
import com.example.analyzer.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobRoleService {

    private final JobRoleRepository jobRoleRepository;
    private final UserRepository userRepository;

    public JobRoleService(JobRoleRepository jobRoleRepository, UserRepository userRepository) {
        this.jobRoleRepository = jobRoleRepository;
        this.userRepository = userRepository;
    }

    public JobRoleResponse createRole(JobRoleRequest request, String adminEmail) {
        User adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        JobRole role = new JobRole();
        role.setTitle(request.getTitle());
        role.setBasicRequirements(request.getBasicRequirements());
        role.setDescription(request.getDescription());
        role.setAdmin(adminUser);

        if (request.getMinSkills() != null) {
            List<RequiredSkill> skills = request.getMinSkills().stream().map(s -> {
                RequiredSkill rs = new RequiredSkill();
                rs.setSkillName(s.getSkillName());
                rs.setSkillCategory(s.getSkillCategory());
                rs.setJobRole(role);
                return rs;
            }).collect(Collectors.toList());
            role.setRequiredSkills(skills);
        }

        JobRole savedRole = jobRoleRepository.save(role);
        return JobRoleResponse.fromEntity(savedRole);
    }

    public List<JobRoleResponse> getAdminRoles(String email) {
        User admin = userRepository.findByEmail(email).orElseThrow();
        return jobRoleRepository.findByAdmin_Id(admin.getId())
                .stream().map(JobRoleResponse::fromEntity).collect(Collectors.toList());
    }

    public List<JobRoleResponse> getRolesByAdminCode(String adminCode) {
        User admin = userRepository.findByAdminCode(adminCode)
                .orElseThrow(() -> new RuntimeException("Invalid Admin ID"));
        return jobRoleRepository.findByAdmin_Id(admin.getId())
                .stream().map(JobRoleResponse::fromEntity).collect(Collectors.toList());
    }
    
    public JobRoleResponse getRole(Long id) {
        JobRole role = jobRoleRepository.findById(id).orElseThrow();
        return JobRoleResponse.fromEntity(role);
    }

    public void deleteRole(Long roleId, String adminEmail) {
        User adminUser = userRepository.findByEmail(adminEmail).orElseThrow();
        JobRole role = jobRoleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        if (!role.getAdmin().getId().equals(adminUser.getId())) {
             throw new RuntimeException("Unauthorized to delete this role");
        }

        jobRoleRepository.delete(role);
    }
}