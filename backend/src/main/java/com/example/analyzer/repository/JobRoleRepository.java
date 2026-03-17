package com.example.analyzer.repository;
import com.example.analyzer.model.JobRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JobRoleRepository extends JpaRepository<JobRole, Long> {
    List<JobRole> findByAdmin_Id(Long adminId);
}