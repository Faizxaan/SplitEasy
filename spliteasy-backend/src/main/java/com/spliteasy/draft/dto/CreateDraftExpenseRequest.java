package com.spliteasy.draft.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CreateDraftExpenseRequest {

    @NotBlank
    @Size(max = 200)
    private String description;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @NotNull
    private UUID paidByParticipantId;

    @Size(max = 20)
    private String category = "OTHER";

    private LocalDate expenseDate;

    @Size(max = 20)
    private String splitType = "EQUAL";

    private List<DraftSplitItemRequest> splits;
}
