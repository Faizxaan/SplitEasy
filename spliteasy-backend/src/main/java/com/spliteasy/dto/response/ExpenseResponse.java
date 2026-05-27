package com.spliteasy.dto.response;

import com.spliteasy.enums.ExpenseCategory;
import com.spliteasy.enums.SplitType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ExpenseResponse {

    private UUID id;
    private UUID groupId;
    private UserResponse paidBy;
    private BigDecimal amount;
    private String description;
    private ExpenseCategory category;
    private LocalDate expenseDate;
    private SplitType splitType;
    private List<ExpenseSplitResponse> splits;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
