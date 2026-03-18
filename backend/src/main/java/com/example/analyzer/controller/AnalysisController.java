package com.example.analyzer.controller;

import com.example.analyzer.dto.AnalysisResponse;
import com.example.analyzer.dto.CourseRecommendation;
import com.example.analyzer.model.StudentAnalysis;
import com.example.analyzer.repository.StudentAnalysisRepository;
import com.example.analyzer.service.AnalysisService;
import com.example.analyzer.service.PdfExportService;
import com.example.analyzer.service.OllamaService;
import com.example.analyzer.service.RecommendationService;
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
    private final RecommendationService recommendationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AnalysisController(AnalysisService analysisService,
                               StudentAnalysisRepository analysisRepository,
                               PdfExportService pdfExportService,
                               RecommendationService recommendationService) {
        this.analysisService = analysisService;
        this.analysisRepository = analysisRepository;
        this.pdfExportService = pdfExportService;
        this.recommendationService = recommendationService;
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

        List<String> missingSkills = List.of();
        List<String> matchedSkills = List.of();
        List<String> partialSkills = List.of();

        try {
            if (a.getMissingSkills() != null)
                missingSkills = objectMapper.readValue(a.getMissingSkills(), new TypeReference<>() {});
            if (a.getMatchedSkills() != null)
                matchedSkills = objectMapper.readValue(a.getMatchedSkills(), new TypeReference<>() {});
            if (a.getPartialSkills() != null)
                partialSkills = objectMapper.readValue(a.getPartialSkills(), new TypeReference<>() {});
        } catch (Exception e) {
            // keep empty lists
        }

        // FIXED: now fetches course recommendations from saved missing skills
        List<CourseRecommendation> courses = recommendationService.getRecommendationsForMissingSkills(missingSkills);

        OllamaService.Scores scores = new OllamaService.Scores();
        scores.certifications = a.getCertificationsScore().intValue();
        scores.responsiveness = a.getResponsivenessScore().intValue();
        scores.creativity = a.getCreativityScore().intValue();
        scores.technicalSkills = a.getTechnicalSkillsScore().intValue();

        AnalysisResponse resp = AnalysisResponse.builder()
                .id(a.getId())
                .studentName(a.getStudent().getName())
                .jobRoleTitle(a.getJobRole().getTitle())
                .matchPercentage(a.getMatchPercentage())
                .matchedSkills(matchedSkills)
                .missingSkills(missingSkills)
                .partialSkills(partialSkills)
                .scores(scores)
                .recommendationSummary(a.getRecommendationSummary())
                .recommendedCourses(courses)
                .analyzedAt(a.getAnalyzedAt())
                .build();

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