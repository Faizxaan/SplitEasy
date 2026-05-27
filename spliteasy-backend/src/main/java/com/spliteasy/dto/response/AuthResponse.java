package com.spliteasy.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AuthResponse {

    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private UUID userId;
    private String fullName;
    private String email;
    private String avatarColor;
}
