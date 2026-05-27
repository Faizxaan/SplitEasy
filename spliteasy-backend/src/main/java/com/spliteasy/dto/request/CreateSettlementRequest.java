package com.spliteasy.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateSettlementRequest {

    @NotNull(message = "Paid to user ID is required")
    private UUID paidToId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @Digits(integer = 8, fraction = 2, message = "Amount format invalid")
    private BigDecimal amount;

    @Size(max = 200, message = "Note must not exceed 200 characters")
    private String note;

    private LocalDateTime settledAt;
}
