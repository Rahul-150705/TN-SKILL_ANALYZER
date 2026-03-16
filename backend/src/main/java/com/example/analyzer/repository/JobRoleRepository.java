package com.example.analyzer.repository;
import com.example.analyzer.model.JobRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRoleRepository extends JpaRepository<JobRole, Long> {
    List<JobRole> findByCompanyId(Long companyId);
}