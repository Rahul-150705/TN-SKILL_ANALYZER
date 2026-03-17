package com.example.analyzer.repository;

import com.example.analyzer.model.StudentAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAnalysisRepository extends JpaRepository<StudentAnalysis, Long> {
    List<StudentAnalysis> findByJobRole_Id(Long jobRoleId);
    List<StudentAnalysis> findByStudent_Id(Long studentId);
    List<StudentAnalysis> findByAdmin_Id(Long adminId);
}