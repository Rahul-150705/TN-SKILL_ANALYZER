package com.example.analyzer.service;

import com.example.analyzer.dto.LoginRequest;
import com.example.analyzer.dto.LoginResponse;
import com.example.analyzer.dto.SignupRequest;
import com.example.analyzer.model.Role;
import com.example.analyzer.model.User;
import com.example.analyzer.repository.UserRepository;
import com.example.analyzer.security.JwtUtil;
import com.example.analyzer.security.UserDetailsImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    public void signup(SignupRequest request) {
        if (request.getName() == null || request.getName().isBlank())
            throw new RuntimeException("Name is required");
        if (request.getEmail() == null || request.getEmail().isBlank())
            throw new RuntimeException("Email is required");
        if (request.getPassword() == null || request.getPassword().length() < 6)
            throw new RuntimeException("Password must be at least 6 characters");
        if (request.getRole() == null || request.getRole().isBlank())
            throw new RuntimeException("Role is required. Must be ADMIN or STUDENT");

        if (userRepository.findByEmail(request.getEmail().toLowerCase()).isPresent())
            throw new RuntimeException("Email already in use");

        Role role;
        try {
            role = Role.valueOf(request.getRole().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role '" + request.getRole() + "'. Must be ADMIN or STUDENT");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        if (role == Role.ADMIN) {
            user.setAdminCode("ADM-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        }

        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null)
            throw new RuntimeException("Email and password are required");

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(),
                            request.getPassword()
                    )
            );

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);

            User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return new LoginResponse(
                    token,
                    user.getId(),
                    user.getName(),
                    user.getRole().name(),
                    user.getAdminCode()
            );

        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }
    }
}