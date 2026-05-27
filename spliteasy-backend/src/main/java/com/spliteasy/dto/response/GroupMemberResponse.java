package com.spliteasy.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class GroupMemberResponse {

    private UUID id;
    private UUID userId;
    private String fullName;
    private String email;
    private String avatarColor;
    private LocalDateTime joinedAt;
}
