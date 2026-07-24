package com.agridoc.service;

import com.agridoc.dto.request.LoginRequest;
import com.agridoc.dto.request.RegisterRequest;
import com.agridoc.dto.response.AuthResponse;
import com.agridoc.entity.User;
import com.agridoc.exception.CustomException;
import com.agridoc.repository.UserRepository;
import com.agridoc.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public User register(RegisterRequest request) {
        // Validate inputs
        if (request.getUsername() == null || request.getUsername().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty() ||
            request.getEmail() == null || request.getEmail().trim().isEmpty() ||
            request.getPhone() == null || request.getPhone().trim().isEmpty() ||
            request.getRegion() == null || request.getRegion().trim().isEmpty() ||
            request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new CustomException("All fields are required for registration", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CustomException("Username is already taken", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email is already registered", HttpStatus.BAD_REQUEST);
        }

        // Validate role
        String role = request.getRole().toUpperCase();
        if (!role.equals("FARMER") && !role.equals("EXPERT") && !role.equals("ADMIN")) {
            throw new CustomException("Invalid role specified. Must be FARMER, EXPERT, or ADMIN", HttpStatus.BAD_REQUEST);
        }

        User user = User.builder()
                .username(request.getUsername().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail().trim())
                .phone(request.getPhone().trim())
                .region(request.getRegion().trim())
                .role(role)
                .fullName(request.getFullName().trim())
                .build();

        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new CustomException("Username and password are required", HttpStatus.BAD_REQUEST);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (Exception e) {
            throw new CustomException("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .region(user.getRegion())
                .build();
    }
}
