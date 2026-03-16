package com.example.analyzer.dto;
import lombok.Data;
@Data
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private String companyName;
}