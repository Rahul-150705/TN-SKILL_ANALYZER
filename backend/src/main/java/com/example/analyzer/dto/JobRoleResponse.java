package com.example.analyzer.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.example.analyzer.model.JobRole;

@Data @Builder
public class JobRoleResponse {
    private Long id;
    private String title;
    private String description;
    private List<RequiredSkillResponse> requiredSkills;
    private LocalDateTime createdAt;
    
    public static JobRoleResponse fromEntity(JobRole role) {
        return JobRoleResponse.builder()
            .id(role.getId())
            .title(role.getTitle())
            .description(role.getDescription())
            .requiredSkills(role.getRequiredSkills() != null ? role.getRequiredSkills().stream()
                .map(RequiredSkillResponse::fromEntity).collect(Collectors.toList()) : null)
            .createdAt(role.getCreatedAt())
            .build();
    }
}