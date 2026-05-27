package com.spliteasy.service;

import com.spliteasy.dto.request.LoginRequest;
import com.spliteasy.dto.request.RegisterRequest;
import com.spliteasy.dto.response.AuthResponse;
import com.spliteasy.dto.response.UserResponse;
import com.spliteasy.entity.User;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(User currentUser);
}
