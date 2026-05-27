package com.spliteasy.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class SplitEntryRequest {

    @NotNull(message = "User ID is required for each split")
    private UUID userId;

    @Positive(message = "Share value must be positive")
    private BigDecimal shareValue;
}
