package com.spliteasy.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class MemberResponse {

    private UUID id;
    private String fullName;
    private String email;
    private String avatarColor;
    private BigDecimal netBalance;
}
