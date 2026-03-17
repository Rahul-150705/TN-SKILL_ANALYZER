package com.example.analyzer.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    // Must be exactly "ADMIN" or "STUDENT" (case-insensitive, handled in AuthService)
    private String role;
}