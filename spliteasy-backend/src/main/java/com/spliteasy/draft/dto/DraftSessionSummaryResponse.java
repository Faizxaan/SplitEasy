package com.spliteasy.draft.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DraftSessionSummaryResponse {
    private UUID id;
    private String title;
    private String currency;
    private String shareToken;
    private int participantCount;
    private int expenseCount;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
}
