package com.spliteasy.controller;

import com.spliteasy.dto.request.LoginRequest;
import com.spliteasy.dto.request.RegisterRequest;
import com.spliteasy.dto.response.AuthResponse;
import com.spliteasy.dto.response.UserResponse;
import com.spliteasy.entity.User;
import com.spliteasy.security.SecurityUtils;
import com.spliteasy.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(authService.getCurrentUser(currentUser));
    }
}
