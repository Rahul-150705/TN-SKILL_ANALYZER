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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
        requestBody.put("model", "llama3");
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            String url = ollamaBaseUrl + "/api/generate";
            String responseStr = restTemplate.postForObject(url, entity, String.class);
            JsonNode root = objectMapper.readTree(responseStr);
            String aiResponse = root.path("response").asText();

            return parseOllamaResponse(aiResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>(); // Return empty list on failure
        }
    }

    private List<String> parseOllamaResponse(String aiResponse) {
        try {
            Pattern pattern = Pattern.compile("\\\\[.*?\\\\]", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(aiResponse);
            if (matcher.find()) {
                String jsonArrayStr = matcher.group(0);
                return objectMapper.readValue(jsonArrayStr, new TypeReference<List<String>>() {
                });
            }
            return new ArrayList<>();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}