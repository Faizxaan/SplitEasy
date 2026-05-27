package com.spliteasy.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class ExpenseSplitResponse {

    private UUID id;
    private UUID userId;
    private String fullName;
    private String avatarColor;
    private BigDecimal amount;
    private BigDecimal shareValue;
}
