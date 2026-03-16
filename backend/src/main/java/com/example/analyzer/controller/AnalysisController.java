package com.example.analyzer.controller;

import com.example.analyzer.dto.AnalysisResponse;
import com.example.analyzer.model.EmployeeAnalysis;
import com.example.analyzer.repository.EmployeeAnalysisRepository;
import com.example.analyzer.service.PdfExportService;
import com.example.analyzer.service.SkillGapService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analyze")
public class AnalysisController {

    private final SkillGapService skillGapService;
    private final EmployeeAnalysisRepository analysisRepository;
    private final PdfExportService pdfExportService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AnalysisController(SkillGapService skillGapService, EmployeeAnalysisRepository analysisRepository, PdfExportService pdfExportService) {
        this.skillGapService = skillGapService;
        this.analysisRepository = analysisRepository;
        this.pdfExportService = pdfExportService;
    }

    @PostMapping("/resume")
    public ResponseEntity<AnalysisResponse> analyzeResume(@RequestParam("file") MultipartFile file,
                                                          @RequestParam("jobRoleId") Long jobRoleId,
                                                          Authentication auth) {
        return ResponseEntity.ok(skillGapService.analyze(auth.getName(), jobRoleId, file));
    }

    @GetMapping("/result/{id}")
    public ResponseEntity<AnalysisResponse> getAnalysisResult(@PathVariable Long id) {
        EmployeeAnalysis a = analysisRepository.findById(id).orElseThrow();
        AnalysisResponse resp = AnalysisResponse.builder()
                .id(a.getId())
                .employeeName(a.getEmployee().getName())
                .jobRoleTitle(a.getJobRole().getTitle())
                .matchPercentage(a.getMatchPercentage())
                .analyzedAt(a.getAnalyzedAt())
                .build();
        
        try{
            if(a.getDetectedSkills() != null) resp.setDetectedSkills(objectMapper.readValue(a.getDetectedSkills(), new TypeReference<>() {}));
            if(a.getMissingSkills() != null) resp.setMissingSkills(objectMapper.readValue(a.getMissingSkills(), new TypeReference<>() {}));
            if(a.getMatchedSkills() != null) resp.setMatchedSkills(objectMapper.readValue(a.getMatchedSkills(), new TypeReference<>() {}));
        } catch(Exception e){}
        
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/my-results")
    public ResponseEntity<List<AnalysisResponse>> getMyResults(Authentication auth) {
        String email = auth.getName();
        List<EmployeeAnalysis> list = analysisRepository.findAll().stream()
                .filter(a -> a.getEmployee().getEmail().equals(email))
                .collect(Collectors.toList());

        List<AnalysisResponse> resp = list.stream().map(a -> 
            AnalysisResponse.builder()
                .id(a.getId())
                .employeeName(a.getEmployee().getName())
                .jobRoleTitle(a.getJobRole().getTitle())
                .matchPercentage(a.getMatchPercentage())
                .analyzedAt(a.getAnalyzedAt())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/export/{id}")
    public ResponseEntity<byte[]> exportReport(@PathVariable Long id) {
        byte[] pdf = pdfExportService.exportAnalysisReport(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "analysis-report.pdf");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}