package com.spliteasy.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResponse {

    private int totalGroups;
    private BigDecimal youAreOwed;
    private BigDecimal youOwe;
    private BigDecimal overallBalance;
    private List<RecentExpenseResponse> recentExpenses;
}
