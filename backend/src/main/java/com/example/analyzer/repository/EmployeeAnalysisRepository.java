package com.example.analyzer.repository;
import com.example.analyzer.model.EmployeeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface EmployeeAnalysisRepository extends JpaRepository<EmployeeAnalysis, Long> {
    List<EmployeeAnalysis> findByEmployeeId(Long employeeId);
    
    @Query("SELECT e FROM EmployeeAnalysis e WHERE e.employee.company.id = :companyId")
    List<EmployeeAnalysis> findByEmployeeCompanyId(@Param("companyId") Long companyId);
    
    @Query("SELECT e FROM EmployeeAnalysis e WHERE e.jobRole.id = :roleId AND e.employee.company.id = :companyId")
    List<EmployeeAnalysis> findByJobRoleIdAndEmployeeCompanyId(@Param("roleId") Long roleId, @Param("companyId") Long companyId);
}