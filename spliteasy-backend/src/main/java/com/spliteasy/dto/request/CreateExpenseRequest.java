package com.spliteasy.dto.request;

import com.spliteasy.enums.ExpenseCategory;
import com.spliteasy.enums.SplitType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CreateExpenseRequest {

    @NotNull(message = "Paid by user ID is required")
    private UUID paidById;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @jakarta.validation.constraints.DecimalMax(value = "99999999.99", message = "Amount exceeds maximum allowed")
    @Digits(integer = 8, fraction = 2, message = "Amount format invalid")
    private BigDecimal amount;

    @NotBlank(message = "Description is required")
    @Size(max = 100, message = "Description must not exceed 100 characters")
    private String description;

    private ExpenseCategory category = ExpenseCategory.OTHER;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    private SplitType splitType = SplitType.EQUAL;

    @NotEmpty(message = "At least one split is required")
    @Valid
    private List<SplitEntryRequest> splits;
}
