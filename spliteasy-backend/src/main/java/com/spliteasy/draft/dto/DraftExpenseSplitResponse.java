package com.spliteasy.draft.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class DraftExpenseSplitResponse {
    private UUID participantId;
    private BigDecimal shareValue;
    private BigDecimal computedAmount;
}
