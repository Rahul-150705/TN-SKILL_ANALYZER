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
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    public void signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        Role role = Role.valueOf(request.getRole().toUpperCase());
        user.setRole(role);
        
        if (role == Role.ADMIN) {
            user.setAdminCode("ADM-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        }

        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);
        
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        
        return new LoginResponse(token, user.getId(), user.getName(), user.getRole().name(), user.getAdminCode());
    }
}