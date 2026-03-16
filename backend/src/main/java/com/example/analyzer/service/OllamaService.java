package com.example.analyzer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OllamaService {

    @Value("${ollama.base-url}")
    private String ollamaBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<String> extractSkills(String resumeText) {
        String prompt = "You are a technical skill extractor for automotive and EV manufacturing resumes.\n" +
                "Extract all technical skills from the resume text below.\n\n" +
                "Rules:\n" +
                "1. Extract only technical/professional skills (not soft skills like communication)\n" +
                "2. Include tools, technologies, certifications, and domain knowledge\n" +
                "3. Normalize skill names (e.g., \"battery mgmt systems\" -> \"Battery Management Systems\")\n" +
                "4. Return ONLY a JSON array of strings. No explanation. No markdown.\n\n" +
                "Example output:\n" +
                "[\"Battery Management Systems\", \"CAN Bus Protocol\", \"Python\", \"Electrical Safety\"]\n\n" +
                "Resume text:\n" + resumeText + "\n\n" +
                "Return ONLY the JSON array:";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "phi3");
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            String url = ollamaBaseUrl + "/api/generate";
            System.out.println("Requesting Ollama at: " + url + " with model: " + requestBody.get("model"));
            String responseStr = restTemplate.postForObject(url, entity, String.class);
            JsonNode root = objectMapper.readTree(responseStr);
            String aiResponse = root.path("response").asText();
            System.out.println("Ollama Raw Response length: " + aiResponse.length());
            System.out.println("Ollama Raw Response Text: " + aiResponse);

            return parseOllamaResponse(aiResponse);
        } catch (Exception e) {
            System.err.println("OLLAMA ERROR: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>(); // Return empty list on failure
        }
    }

    public List<String> matchSkillsSemantically(List<String> required, List<String> detected) {
        if(required.isEmpty() || detected.isEmpty()) return new ArrayList<>();

        String prompt = "You are an AI tasked with matching technical skills based on meaning/semantics.\n" +
                "Given a list of REQUIRED skills and a list of DETECTED skills, find which REQUIRED skills are semantically present in the DETECTED skills. " +
                "Match them even if worded differently (e.g., 'Battery Owner' matches 'Owner of Battery').\n\n" +
                "REQUIRED SKILLS: " + required + "\n" +
                "DETECTED SKILLS: " + detected + "\n\n" +
                "Return ONLY a JSON array containing the exact string names of the REQUIRED SKILLS that have a semantic match in the DETECTED SKILLS. Do not include un-matched skills. No explanation.\n" +
                "Example output:\n" +
                "[\"Battery Owner\", \"Python Programming\"]\n\n" +
                "Return ONLY the JSON array:";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "phi3");
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            String url = ollamaBaseUrl + "/api/generate";
            System.out.println("Semantic Match Prompt: " + prompt);
            String responseStr = restTemplate.postForObject(url, entity, String.class);
            JsonNode root = objectMapper.readTree(responseStr);
            String aiResponse = root.path("response").asText();
            System.out.println("Semantic Match AI Output: " + aiResponse);

            return parseOllamaResponse(aiResponse);
        } catch (Exception e) {
            System.err.println("OLLAMA MATCH ERROR: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private List<String> parseOllamaResponse(String aiResponse) {
        try {
            System.out.println("Parsing AI response...");
            // Extract anything between [ and ]
            Pattern pattern = Pattern.compile("\\[.*?\\]", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(aiResponse);
            if (matcher.find()) {
                String jsonArrayStr = matcher.group(0);
                System.out.println("Parsed JSON Array string: " + jsonArrayStr);
                List<String> parsed = objectMapper.readValue(jsonArrayStr, new TypeReference<List<String>>() {});
                System.out.println("Successfully extracted skills: " + parsed);
                return parsed;
            }
            System.err.println("Regex failed to find a JSON array in the AI response.");
            return new ArrayList<>();
        } catch (Exception e) {
            System.err.println("JSON Parse ERROR: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public static class ComprehensiveResult {
        public int overallMatchScore;
        public String matchCategory;
        public Map<String, Integer> categoryScores;
        public SkillsAnalysis skillsAnalysis;
        public String assessment;
        public String recommendation;
    }

    public static class SkillsAnalysis {
        public List<String> matched = new ArrayList<>();
        public List<String> partial = new ArrayList<>();
        public List<String> missing = new ArrayList<>();
    }

    public ComprehensiveResult generateComprehensiveAnalysis(String resumeText, String jobTitle, String jobDescription, List<String> requiredSkills) {
        String prompt = "You are an expert HR Technical Recruiter specializing in Automotive and EV industries.\n" +
                "Evaluate the following candidate's resume against the Job Role requirements.\n\n" +
                "JOB ROLE: " + jobTitle + "\n" +
                "JOB DESCRIPTION: " + jobDescription + "\n" +
                "REQUIRED SKILLS: " + requiredSkills + "\n\n" +
                "RESUME:\n" + resumeText + "\n\n" +
                "Analyze the candidate and return EXACTLY a JSON object with this precise structure (no markdown, no extra text):\n" +
                "{\n" +
                "  \"overallMatchScore\": 86,\n" +
                "  \"matchCategory\": \"Strong match\",\n" +
                "  \"categoryScores\": {\n" +
                "    \"Responsibilities\": 90,\n" +
                "    \"Skills coverage\": 86,\n" +
                "    \"Experience relevance\": 95,\n" +
                "    \"Safety knowledge\": 92,\n" +
                "    \"Certifications\": 100,\n" +
                "    \"Diagnostic tools\": 80\n" +
                "  },\n" +
                "  \"skillsAnalysis\": {\n" +
                "    \"matched\": [\"skill1\"],\n" +
                "    \"partial\": [\"skill2\"],\n" +
                "    \"missing\": [\"skill3\"]\n" +
                "  },\n" +
                "  \"assessment\": \"Detailed 2-3 sentence paragraph assessing their strengths and gaps\",\n" +
                "  \"recommendation\": \"1-2 sentence final hiring recommendation\"\n" +
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
        fallback.overallMatchScore = 0;
        fallback.matchCategory = "Error evaluating";
        fallback.categoryScores = new HashMap<>();
        fallback.skillsAnalysis = new SkillsAnalysis();
        fallback.assessment = "Could not parse AI recommendation.";
        fallback.recommendation = "Review manually.";
        return fallback;
    }

    public void streamComprehensiveAnalysis(String resumeText, String jobTitle, String jobDescription, List<String> requiredSkills, Consumer<String> tokenConsumer) {
        String prompt = "You are an expert HR Technical Recruiter specializing in Automotive and EV industries.\n" +
                "Evaluate the following candidate's resume against the Job Role requirements.\n\n" +
                "JOB ROLE: " + jobTitle + "\n" +
                "JOB DESCRIPTION: " + jobDescription + "\n" +
                "REQUIRED SKILLS: " + requiredSkills + "\n\n" +
                "RESUME:\n" + resumeText + "\n\n" +
                "Analyze the candidate and return EXACTLY a JSON object. Return ONLY the JSON object. No intro, no outro.\n" +
                "CRITICAL: You MUST output the JSON keys in this EXACT sequence for streaming parsing:\n" +
                "1. \"categoryScores\" (Include scores for: \"Certifications\", \"Responsibilities\", \"Experience relevance\", \"Safety knowledge\", \"Diagnostic tools\", \"Skills coverage\" - in this EXACT order)\n" +
                "2. \"overallMatchScore\"\n" +
                "3. \"matchCategory\"\n" +
                "4. \"skillsAnalysis\"\n" +
                "5. \"assessment\"\n" +
                "6. \"recommendation\"";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "phi3");
        requestBody.put("prompt", prompt);
        requestBody.put("stream", true);

        try {
            String jsonRequest = objectMapper.writeValueAsString(requestBody);
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ollamaBaseUrl + "/api/generate"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                    .build();

            client.sendAsync(request, HttpResponse.BodyHandlers.ofLines())
                    .thenAccept(response -> {
                        response.body().forEach(line -> {
                            try {
                                JsonNode node = objectMapper.readTree(line);
                                String token = node.path("response").asText();
                                boolean done = node.path("done").asBoolean();
                                tokenConsumer.accept(token);
                                if (done) tokenConsumer.accept("[DONE]");
                            } catch (Exception e) {
                                // ignore parse errors on chunks
                            }
                        });
                    }).join();
        } catch (Exception e) {
            e.printStackTrace();
            tokenConsumer.accept("[ERROR]");
        }
    }
}