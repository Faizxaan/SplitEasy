package com.spliteasy.dto.response;

import com.spliteasy.enums.Currency;
import com.spliteasy.enums.GroupCategory;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class GroupSummaryResponse {

    private UUID id;
    private String name;
    private String description;
    private GroupCategory category;
    private Currency currency;
    private String inviteCode;
    private int memberCount;
    private BigDecimal totalExpenses;
    private BigDecimal userBalance;
    private LocalDateTime createdAt;
}
