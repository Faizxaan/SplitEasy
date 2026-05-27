package com.spliteasy.service.impl;

import com.spliteasy.dto.response.DashboardResponse;
import com.spliteasy.dto.response.RecentExpenseResponse;
import com.spliteasy.entity.Expense;
import com.spliteasy.entity.Group;
import com.spliteasy.entity.User;
import com.spliteasy.repository.ExpenseRepository;
import com.spliteasy.repository.ExpenseSplitRepository;
import com.spliteasy.repository.GroupRepository;
import com.spliteasy.repository.SettlementRepository;
import com.spliteasy.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final SettlementRepository settlementRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(User currentUser) {
        List<Group> groups = groupRepository.findGroupsByMemberId(currentUser.getId());
        int totalGroups = groups.size();

        BigDecimal youAreOwed = BigDecimal.ZERO;
        BigDecimal youOwe = BigDecimal.ZERO;

        for (Group group : groups) {
            UUID groupId = group.getId();
            BigDecimal totalPaid = nullSafe(expenseRepository.sumPaidByUserInGroup(groupId, currentUser.getId()));
            BigDecimal totalOwed = nullSafe(expenseSplitRepository.sumOwedAmountByGroupIdAndUserId(groupId, currentUser.getId()));
            BigDecimal settledOut = nullSafe(settlementRepository.sumPaidByUserInGroup(groupId, currentUser.getId()));
            BigDecimal settledIn = nullSafe(settlementRepository.sumReceivedByUserInGroup(groupId, currentUser.getId()));
            BigDecimal net = totalPaid.subtract(totalOwed).subtract(settledOut).add(settledIn);

            if (net.compareTo(BigDecimal.ZERO) > 0) {
                youAreOwed = youAreOwed.add(net);
            } else if (net.compareTo(BigDecimal.ZERO) < 0) {
                youOwe = youOwe.add(net.abs());
            }
        }

        List<UUID> groupIds = groups.stream().map(Group::getId).toList();
        List<RecentExpenseResponse> recentExpenses = Collections.emptyList();
        if (!groupIds.isEmpty()) {
            recentExpenses = expenseRepository
                    .findRecentByGroupIds(groupIds, PageRequest.of(0, 5))
                    .stream()
                    .map(this::toRecentExpenseResponse)
                    .toList();
        }

        return DashboardResponse.builder()
                .totalGroups(totalGroups)
                .youAreOwed(youAreOwed)
                .youOwe(youOwe)
                .overallBalance(youAreOwed.subtract(youOwe))
                .recentExpenses(recentExpenses)
                .build();
    }

    private RecentExpenseResponse toRecentExpenseResponse(Expense expense) {
        return RecentExpenseResponse.builder()
                .id(expense.getId())
                .groupId(expense.getGroup().getId())
                .groupName(expense.getGroup().getName())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .currency(expense.getGroup().getCurrency())
                .category(expense.getCategory())
                .paidByName(expense.getPaidBy().getFullName())
                .expenseDate(expense.getExpenseDate())
                .build();
    }

    private BigDecimal nullSafe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
