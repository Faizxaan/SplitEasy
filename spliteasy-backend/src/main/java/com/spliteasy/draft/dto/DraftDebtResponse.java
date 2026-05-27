package com.spliteasy.draft.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DraftDebtResponse {
    private DraftParticipantResponse from;
    private DraftParticipantResponse to;
    private BigDecimal amount;
}
