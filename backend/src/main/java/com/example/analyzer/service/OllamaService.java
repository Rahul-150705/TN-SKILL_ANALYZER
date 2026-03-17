package com.example.analyzer.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OllamaService {

    @Value("${ollama.base-url}")
    private String ollamaBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class ComprehensiveResult {
        @JsonProperty("match_percentage")
        public int matchPercentage;
        @JsonProperty("matched_skills")
        public List<String> matchedSkills;
        @JsonProperty("missing_skills")
        public List<String> missingSkills;
        @JsonProperty("partial_skills")
        public List<String> partialSkills;
        public Scores scores;
        @JsonProperty("recommendation_summary")
        public String recommendationSummary;
    }

    public static class Scores {
        public int certifications;
        public int responsiveness;
        public int creativity;
        @JsonProperty("technical_skills")
        public int technicalSkills;
    }

    public ComprehensiveResult generateComprehensiveAnalysis(String resumeText, String roleName, String basicRequirements, String description, List<String> minSkills) {
        String prompt = "You are an expert HR Technical Recruiter.\n" +
                "Evaluate the following candidate's resume against the Job Role requirements.\n\n" +
                "ROLE NAME: " + roleName + "\n" +
                "BASIC REQUIREMENTS: " + basicRequirements + "\n" +
                "DESCRIPTION: " + description + "\n" +
                "MINIMUM SKILLS: " + minSkills + "\n\n" +
                "RESUME:\n" + resumeText + "\n\n" +
                "Analyze the candidate and return EXACTLY a JSON object with this precise structure (no markdown, no extra text):\n" +
                "{\n" +
                "  \"match_percentage\": 85,\n" +
                "  \"matched_skills\": [\"skill1\", \"skill2\"],\n" +
                "  \"missing_skills\": [\"skill3\"],\n" +
                "  \"partial_skills\": [\"skill4\"],\n" +
                "  \"scores\": {\n" +
                "    \"certifications\": 90,\n" +
                "    \"responsiveness\": 80,\n" +
                "    \"creativity\": 85,\n" +
                "    \"technical_skills\": 88\n" +
                "  },\n" +
                "  \"recommendation_summary\": \"Solid candidate with good technical overlap but missing specific tool experience.\"\n" +
                "}\n\n" +
                "Return ONLY the JSON object:";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "phi3");
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            System.out.println("Requesting Comprehensive Analysis from Ollama...");
            String responseStr = restTemplate.postForObject(ollamaBaseUrl + "/api/generate", entity, String.class);
            JsonNode root = objectMapper.readTree(responseStr);
            String aiResponse = root.path("response").asText();
            System.out.println("Comprehensive AI Output: " + aiResponse);

            Pattern pattern = Pattern.compile("\\{.*\\}", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(aiResponse);
            if (matcher.find()) {
                String jsonStr = matcher.group(0);
                return objectMapper.readValue(jsonStr, ComprehensiveResult.class);
            }
        } catch (Exception e) {
            System.err.println("COMPREHENSIVE MATCH ERROR: " + e.getMessage());
        }

        ComprehensiveResult fallback = new ComprehensiveResult();
        fallback.matchPercentage = 0;
        fallback.matchedSkills = new ArrayList<>();
        fallback.missingSkills = new ArrayList<>();
        fallback.partialSkills = new ArrayList<>();
        fallback.scores = new Scores();
        fallback.recommendationSummary = "Error evaluating candidate.";
        return fallback;
    }
}