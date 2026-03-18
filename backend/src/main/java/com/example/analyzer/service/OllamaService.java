package com.example.analyzer.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OllamaService {

    @Value("${ollama.base-url}")
    private String ollamaBaseUrl;

    // FIXED: set 3-minute timeout — Phi3 analysis can take 60-120 seconds
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OllamaService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);   // 10 seconds to connect
        factory.setReadTimeout(180_000);     // 3 minutes to read response
        this.restTemplate = new RestTemplate(factory);
    }

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

    public ComprehensiveResult generateComprehensiveAnalysis(String resumeText, String roleName,
            String basicRequirements, String description, List<String> minSkills) {

        String prompt = "You are an expert HR Technical Recruiter.\n" +
                "Evaluate the following candidate's resume against the Job Role requirements.\n\n" +
                "ROLE NAME: " + roleName + "\n" +
                "BASIC REQUIREMENTS: " + basicRequirements + "\n" +
                "DESCRIPTION: " + description + "\n" +
                "MINIMUM SKILLS REQUIRED: " + minSkills + "\n\n" +
                "RESUME TEXT:\n" + resumeText + "\n\n" +
                "IMPORTANT: Respond with ONLY a valid JSON object. No markdown. No explanation. No extra text.\n" +
                "The JSON must follow this EXACT structure:\n" +
                "{\n" +
                "  \"match_percentage\": 75,\n" +
                "  \"matched_skills\": [\"skill1\", \"skill2\"],\n" +
                "  \"missing_skills\": [\"skill3\", \"skill4\"],\n" +
                "  \"partial_skills\": [\"skill5\"],\n" +
                "  \"scores\": {\n" +
                "    \"certifications\": 70,\n" +
                "    \"responsiveness\": 80,\n" +
                "    \"creativity\": 65,\n" +
                "    \"technical_skills\": 75\n" +
                "  },\n" +
                "  \"recommendation_summary\": \"Brief honest summary of candidate fit.\"\n" +
                "}\n\n" +
                "Rules:\n" +
                "- match_percentage must be a number 0-100\n" +
                "- All score values must be numbers 0-100\n" +
                "- matched_skills: skills from resume that match requirements\n" +
                "- missing_skills: required skills completely absent from resume\n" +
                "- partial_skills: skills mentioned but not at required level\n" +
                "- Start your response with { and end with }\n" +
                "JSON:";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "phi3");
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            System.out.println("Sending request to Ollama...");
            String responseStr = restTemplate.postForObject(ollamaBaseUrl + "/api/generate", entity, String.class);
            JsonNode root = objectMapper.readTree(responseStr);
            String aiResponse = root.path("response").asText();
            System.out.println("Ollama raw output: " + aiResponse);

            Pattern pattern = Pattern.compile("\\{[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(aiResponse);
            if (matcher.find()) {
                String jsonStr = matcher.group(0);
                System.out.println("Extracted JSON: " + jsonStr);
                return objectMapper.readValue(jsonStr, ComprehensiveResult.class);
            }
            System.err.println("No JSON found in Ollama response");
        } catch (Exception e) {
            System.err.println("Ollama error: " + e.getMessage());
        }

        // Fallback
        ComprehensiveResult fallback = new ComprehensiveResult();
        fallback.matchPercentage = 0;
        fallback.matchedSkills = new ArrayList<>();
        fallback.missingSkills = new ArrayList<>();
        fallback.partialSkills = new ArrayList<>();
        fallback.scores = new Scores();
        fallback.recommendationSummary = "Analysis failed. Please try again.";
        return fallback;
    }
}