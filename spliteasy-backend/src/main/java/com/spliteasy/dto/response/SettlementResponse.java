package com.spliteasy.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SettlementResponse {

    private UUID id;
    private UUID groupId;
    private UserResponse paidBy;
    private UserResponse paidTo;
    private BigDecimal amount;
    private String note;
    private LocalDateTime settledAt;
    private LocalDateTime createdAt;
}
