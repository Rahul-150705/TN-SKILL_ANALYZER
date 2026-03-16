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
import java.util.UUID;

@Service
public class JobRoleService {

    private final JobRoleRepository jobRoleRepository;
    private final UserRepository userRepository;

    public JobRoleService(JobRoleRepository jobRoleRepository, UserRepository userRepository) {
        this.jobRoleRepository = jobRoleRepository;
        this.userRepository = userRepository;
    }

    public JobRoleResponse createRole(JobRoleRequest request, String hrEmail) {
        User hrUser = userRepository.findByEmail(hrEmail)
                .orElseThrow(() -> new RuntimeException("HR User not found"));

        JobRole role = new JobRole();
        role.setTitle(request.getTitle());
        role.setDescription(request.getDescription());
        role.setCompany(hrUser.getCompany());
        role.setCreatedBy(hrUser);
        role.setUniqueId(UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase());

        if (request.getRequiredSkills() != null) {
            List<RequiredSkill> skills = request.getRequiredSkills().stream().map(s -> {
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

    public List<JobRoleResponse> getRolesForCompany(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Long companyId = user.getCompany() != null ? user.getCompany().getId() : null;
        if(companyId == null) return List.of();
        return jobRoleRepository.findByCompanyId(companyId)
                .stream().map(JobRoleResponse::fromEntity).collect(Collectors.toList());
    }
    
    public JobRoleResponse getRole(Long id, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        JobRole role = jobRoleRepository.findById(id).orElseThrow();
        if(!role.getCompany().getId().equals(user.getCompany().getId())) {
             throw new RuntimeException("Unauthorized mapping to another company");
        }
        return JobRoleResponse.fromEntity(role);
    }

    public List<JobRoleResponse> getRolesByHrId(Long hrId) {
        return jobRoleRepository.findByCreatedById(hrId)
                .stream().map(JobRoleResponse::fromEntity).collect(Collectors.toList());
    }

    public JobRoleResponse getRoleByUniqueId(String uniqueId) {
        JobRole role = jobRoleRepository.findByUniqueId(uniqueId)
                .orElseThrow(() -> new RuntimeException("Role not found with ID: " + uniqueId));
        return JobRoleResponse.fromEntity(role);
    }

    public void deleteRole(Long roleId, String hrEmail) {
        User hrUser = userRepository.findByEmail(hrEmail).orElseThrow();
        JobRole role = jobRoleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        if (!role.getCompany().getId().equals(hrUser.getCompany().getId())) {
            throw new RuntimeException("Unauthorized to delete this role");
        }

        jobRoleRepository.delete(role);
    }
}