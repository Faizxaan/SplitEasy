package com.spliteasy.draft.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class DraftExpenseResponse {
    private UUID id;
    private String description;
    private BigDecimal amount;
    private String category;
    private LocalDate expenseDate;
    private String splitType;
    private UUID paidByParticipantId;
    private String paidByParticipantName;
    private List<DraftExpenseSplitResponse> splits;
}
