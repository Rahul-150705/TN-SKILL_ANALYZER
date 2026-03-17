package com.example.analyzer.controller;

import com.example.analyzer.dto.AnalysisResponse;
import com.example.analyzer.model.StudentAnalysis;
import com.example.analyzer.repository.StudentAnalysisRepository;
import com.example.analyzer.service.AnalysisService;
import com.example.analyzer.service.PdfExportService;
import com.example.analyzer.service.OllamaService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analyze")
public class AnalysisController {

    private final AnalysisService analysisService;
    private final StudentAnalysisRepository analysisRepository;
    private final PdfExportService pdfExportService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AnalysisController(AnalysisService analysisService, StudentAnalysisRepository analysisRepository, PdfExportService pdfExportService) {
        this.analysisService = analysisService;
        this.analysisRepository = analysisRepository;
        this.pdfExportService = pdfExportService;
    }

    @PostMapping("/resume")
    public ResponseEntity<AnalysisResponse> analyzeResume(@RequestParam("file") MultipartFile file,
                                                          @RequestParam("jobRoleId") Long jobRoleId,
                                                          Authentication auth) {
        return ResponseEntity.ok(analysisService.analyze(auth.getName(), jobRoleId, file));
    }

    @GetMapping("/result/{id}")
    public ResponseEntity<AnalysisResponse> getAnalysisResult(@PathVariable Long id) {
        StudentAnalysis a = analysisRepository.findById(id).orElseThrow();
        AnalysisResponse resp = AnalysisResponse.builder()
                .id(a.getId())
                .studentName(a.getStudent().getName())
                .jobRoleTitle(a.getJobRole().getTitle())
                .matchPercentage(a.getMatchPercentage())
                .recommendationSummary(a.getRecommendationSummary())
                .analyzedAt(a.getAnalyzedAt())
                .build();
        
        OllamaService.Scores scores = new OllamaService.Scores();
        scores.certifications = a.getCertificationsScore().intValue();
        scores.responsiveness = a.getResponsivenessScore().intValue();
        scores.creativity = a.getCreativityScore().intValue();
        scores.technicalSkills = a.getTechnicalSkillsScore().intValue();
        resp.setScores(scores);

        try {
            if(a.getMissingSkills() != null) resp.setMissingSkills(objectMapper.readValue(a.getMissingSkills(), new TypeReference<>() {}));
            if(a.getMatchedSkills() != null) resp.setMatchedSkills(objectMapper.readValue(a.getMatchedSkills(), new TypeReference<>() {}));
            if(a.getPartialSkills() != null) resp.setPartialSkills(objectMapper.readValue(a.getPartialSkills(), new TypeReference<>() {}));
        } catch(Exception e){}
        
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/student/my-results")
    public ResponseEntity<List<AnalysisResponse>> getMyResults(Authentication auth) {
        String email = auth.getName();
        List<StudentAnalysis> list = analysisRepository.findAll().stream()
                .filter(a -> a.getStudent().getEmail().equals(email))
                .collect(Collectors.toList());

        List<AnalysisResponse> resp = list.stream().map(a -> 
            AnalysisResponse.builder()
                .id(a.getId())
                .studentName(a.getStudent().getName())
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