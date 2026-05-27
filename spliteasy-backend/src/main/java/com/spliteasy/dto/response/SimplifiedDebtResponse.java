package com.spliteasy.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SimplifiedDebtResponse {

    private MemberResponse from;
    private MemberResponse to;
    private BigDecimal amount;
}
