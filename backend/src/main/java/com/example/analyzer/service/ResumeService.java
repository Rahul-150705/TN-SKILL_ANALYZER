package com.example.analyzer.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
public class ResumeService {
    public String extractText(MultipartFile file) {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String rawText = stripper.getText(document);
            System.out.println("Resume Size extracted: " + rawText.length() + " characters");
            return cleanText(rawText);
        } catch (IOException e) {
            throw new RuntimeException("Error extracting PDF text: " + e.getMessage());
        }
    }

    private String cleanText(String text) {
        // FIXED: \\\\s+ was treating it as literal text, not whitespace
        return text.replaceAll("[^a-zA-Z0-9 \\n\\r.,]", " ")
                   .replaceAll("\\s+", " ")
                   .trim();
    }
}