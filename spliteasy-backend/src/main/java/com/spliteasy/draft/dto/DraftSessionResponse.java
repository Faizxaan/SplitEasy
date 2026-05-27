package com.spliteasy.draft.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class DraftSessionResponse {
    private UUID id;
    private String title;
    private String currency;
    private String shareToken;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<DraftParticipantResponse> participants;
    private List<DraftExpenseResponse> expenses;
    private BigDecimal totalAmount;
    private List<DraftDebtResponse> settlements;
}
