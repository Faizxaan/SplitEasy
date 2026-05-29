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
    @Size(max = 100, message = "Description must not exceed 100 characters")
    private String description;

    @NotNull
    @DecimalMin("0.01")
    @jakarta.validation.constraints.DecimalMax(value = "99999999.99", message = "Amount exceeds maximum allowed")
    @jakarta.validation.constraints.Digits(integer = 8, fraction = 2, message = "Amount format invalid")
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
