package com.spliteasy.draft.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class DraftSplitItemRequest {
    private UUID participantId;
    private BigDecimal shareValue;
}
