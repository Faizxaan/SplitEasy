package com.spliteasy.dto.response;

import com.spliteasy.enums.Currency;
import com.spliteasy.enums.ExpenseCategory;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class RecentExpenseResponse {

    private UUID id;
    private UUID groupId;
    private String groupName;
    private String description;
    private BigDecimal amount;
    private Currency currency;
    private ExpenseCategory category;
    private String paidByName;
    private LocalDate expenseDate;
}
