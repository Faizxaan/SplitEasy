package com.spliteasy.service.impl;

import com.spliteasy.dto.request.CreateExpenseRequest;
import com.spliteasy.dto.request.SplitEntryRequest;
import com.spliteasy.dto.response.ExpenseResponse;
import com.spliteasy.dto.response.ExpenseSplitResponse;
import com.spliteasy.dto.response.UserResponse;
import com.spliteasy.entity.Expense;
import com.spliteasy.entity.ExpenseSplit;
import com.spliteasy.entity.Group;
import com.spliteasy.entity.User;
import com.spliteasy.enums.ExpenseCategory;
import com.spliteasy.enums.SplitType;
import com.spliteasy.exception.BadRequestException;
import com.spliteasy.exception.ForbiddenException;
import com.spliteasy.exception.ResourceNotFoundException;
import com.spliteasy.repository.*;
import com.spliteasy.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseServiceImpl implements ExpenseService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;

    @Override
    @Transactional
    public ExpenseResponse createExpense(UUID groupId, CreateExpenseRequest request, User currentUser) {
        Group group = findGroupAndVerifyMembership(groupId, currentUser);
        User paidBy = userRepository.findById(request.getPaidById())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getPaidById()));
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, paidBy.getId())) {
            throw new BadRequestException("The payer must be a member of the group");
        }

        Expense expense = Expense.builder()
                .group(group)
                .paidBy(paidBy)
                .amount(request.getAmount().setScale(2, RoundingMode.HALF_UP))
                .description(request.getDescription().trim())
                .category(request.getCategory() != null ? request.getCategory() : ExpenseCategory.OTHER)
                .expenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : LocalDate.now())
                .splitType(request.getSplitType() != null ? request.getSplitType() : SplitType.EQUAL)
                .build();
        expenseRepository.save(expense);

        List<ExpenseSplit> splits = calculateSplits(expense, request, groupId);
        expenseSplitRepository.saveAll(splits);
        expense.setSplits(splits);

        log.info("Expense '{}' created in group {}", expense.getDescription(), groupId);
        return buildExpenseResponse(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExpenseResponse> getExpenses(UUID groupId, User currentUser,
                                              ExpenseCategory category, UUID memberId,
                                              LocalDate dateFrom, LocalDate dateTo, Pageable pageable) {
        findGroupAndVerifyMembership(groupId, currentUser);
        Page<Expense> expenses;
        if (category != null) {
            expenses = expenseRepository.findByGroupIdAndCategory(groupId, category, pageable);
        } else if (memberId != null) {
            expenses = expenseRepository.findByGroupIdAndPaidById(groupId, memberId, pageable);
        } else if (dateFrom != null && dateTo != null) {
            expenses = expenseRepository.findByGroupIdAndDateRange(groupId, dateFrom, dateTo, pageable);
        } else {
            expenses = expenseRepository.findByGroupId(groupId, pageable);
        }
        return expenses.map(this::buildExpenseResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseDetail(UUID groupId, UUID expenseId, User currentUser) {
        findGroupAndVerifyMembership(groupId, currentUser);
        Expense expense = findExpenseInGroup(expenseId, groupId);
        return buildExpenseResponse(expense);
    }

    @Override
    @Transactional
    public ExpenseResponse updateExpense(UUID groupId, UUID expenseId, CreateExpenseRequest request, User currentUser) {
        findGroupAndVerifyMembership(groupId, currentUser);
        Expense expense = findExpenseInGroup(expenseId, groupId);
        if (!expense.getPaidBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the expense creator can update it");
        }
        User paidBy = userRepository.findById(request.getPaidById())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getPaidById()));

        expense.setPaidBy(paidBy);
        expense.setAmount(request.getAmount().setScale(2, RoundingMode.HALF_UP));
        expense.setDescription(request.getDescription().trim());
        expense.setCategory(request.getCategory() != null ? request.getCategory() : ExpenseCategory.OTHER);
        expense.setExpenseDate(request.getExpenseDate());
        expense.setSplitType(request.getSplitType() != null ? request.getSplitType() : SplitType.EQUAL);
        expense.getSplits().clear();
        expenseRepository.saveAndFlush(expense);

        List<ExpenseSplit> splits = calculateSplits(expense, request, groupId);
        expenseSplitRepository.saveAll(splits);
        expense.getSplits().addAll(splits);

        return buildExpenseResponse(expense);
    }

    @Override
    @Transactional
    public void deleteExpense(UUID groupId, UUID expenseId, User currentUser) {
        findGroupAndVerifyMembership(groupId, currentUser);
        Expense expense = findExpenseInGroup(expenseId, groupId);
        if (!expense.getPaidBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the expense creator can delete it");
        }
        expenseRepository.delete(expense);
    }

    private List<ExpenseSplit> calculateSplits(Expense expense, CreateExpenseRequest request, UUID groupId) {
        List<SplitEntryRequest> splitRequests = request.getSplits();
        BigDecimal totalAmount = expense.getAmount();
        SplitType splitType = expense.getSplitType();

        validateSplitUsers(splitRequests, groupId);

        return switch (splitType) {
            case EQUAL -> calculateEqualSplits(expense, splitRequests, totalAmount);
            case EXACT -> calculateExactSplits(expense, splitRequests, totalAmount);
            case PERCENTAGE -> calculatePercentageSplits(expense, splitRequests, totalAmount);
            case SHARES -> calculateSharesSplits(expense, splitRequests, totalAmount);
        };
    }

    private List<ExpenseSplit> calculateEqualSplits(Expense expense, List<SplitEntryRequest> splitRequests, BigDecimal total) {
        int count = splitRequests.size();
        BigDecimal baseShare = total.divide(BigDecimal.valueOf(count), 2, RoundingMode.FLOOR);
        BigDecimal remainder = total.subtract(baseShare.multiply(BigDecimal.valueOf(count)));

        List<ExpenseSplit> splits = new ArrayList<>();
        for (int i = 0; i < splitRequests.size(); i++) {
            User user = getUserFromRequest(splitRequests.get(i).getUserId());
            BigDecimal amount = i == 0 ? baseShare.add(remainder) : baseShare;
            splits.add(ExpenseSplit.builder().expense(expense).user(user).amount(amount).build());
        }
        return splits;
    }

    private List<ExpenseSplit> calculateExactSplits(Expense expense, List<SplitEntryRequest> splitRequests, BigDecimal total) {
        BigDecimal sum = splitRequests.stream()
                .map(r -> r.getShareValue() != null ? r.getShareValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (sum.compareTo(total) != 0) {
            throw new BadRequestException(
                    String.format("Sum of exact amounts (%.2f) must equal total expense amount (%.2f)", sum, total));
        }
        return splitRequests.stream().map(r -> ExpenseSplit.builder()
                .expense(expense)
                .user(getUserFromRequest(r.getUserId()))
                .amount(r.getShareValue().setScale(2, RoundingMode.HALF_UP))
                .shareValue(r.getShareValue())
                .build()).toList();
    }

    private List<ExpenseSplit> calculatePercentageSplits(Expense expense, List<SplitEntryRequest> splitRequests, BigDecimal total) {
        BigDecimal totalPct = splitRequests.stream()
                .map(r -> r.getShareValue() != null ? r.getShareValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalPct.compareTo(new BigDecimal("100")) != 0) {
            throw new BadRequestException(
                    String.format("Percentages must sum to 100, but got %.2f", totalPct));
        }
        List<ExpenseSplit> splits = new ArrayList<>();
        BigDecimal allocated = BigDecimal.ZERO;
        for (int i = 0; i < splitRequests.size(); i++) {
            SplitEntryRequest r = splitRequests.get(i);
            User user = getUserFromRequest(r.getUserId());
            BigDecimal amount;
            if (i == splitRequests.size() - 1) {
                amount = total.subtract(allocated).setScale(2, RoundingMode.HALF_UP);
            } else {
                amount = total.multiply(r.getShareValue())
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                allocated = allocated.add(amount);
            }
            splits.add(ExpenseSplit.builder().expense(expense).user(user)
                    .amount(amount).shareValue(r.getShareValue()).build());
        }
        return splits;
    }

    private List<ExpenseSplit> calculateSharesSplits(Expense expense, List<SplitEntryRequest> splitRequests, BigDecimal total) {
        BigDecimal totalShares = splitRequests.stream()
                .map(r -> r.getShareValue() != null ? r.getShareValue() : BigDecimal.ONE)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalShares.compareTo(BigDecimal.ZERO) == 0) {
            throw new BadRequestException("Total shares cannot be zero");
        }
        List<ExpenseSplit> splits = new ArrayList<>();
        BigDecimal allocated = BigDecimal.ZERO;
        for (int i = 0; i < splitRequests.size(); i++) {
            SplitEntryRequest r = splitRequests.get(i);
            User user = getUserFromRequest(r.getUserId());
            BigDecimal share = r.getShareValue() != null ? r.getShareValue() : BigDecimal.ONE;
            BigDecimal amount;
            if (i == splitRequests.size() - 1) {
                amount = total.subtract(allocated).setScale(2, RoundingMode.HALF_UP);
            } else {
                amount = total.multiply(share).divide(totalShares, 2, RoundingMode.HALF_UP);
                allocated = allocated.add(amount);
            }
            splits.add(ExpenseSplit.builder().expense(expense).user(user)
                    .amount(amount).shareValue(share).build());
        }
        return splits;
    }

    private void validateSplitUsers(List<SplitEntryRequest> splitRequests, UUID groupId) {
        Set<UUID> memberIds = groupMemberRepository.findByGroupId(groupId).stream()
                .map(gm -> gm.getUser().getId())
                .collect(Collectors.toSet());
        for (SplitEntryRequest r : splitRequests) {
            if (!memberIds.contains(r.getUserId())) {
                throw new BadRequestException("User " + r.getUserId() + " is not a member of this group");
            }
        }
    }

    private User getUserFromRequest(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private Group findGroupAndVerifyMembership(UUID groupId, User currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUser.getId())) {
            throw new ForbiddenException("You are not a member of this group");
        }
        return group;
    }

    private Expense findExpenseInGroup(UUID expenseId, UUID groupId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));
        if (!expense.getGroup().getId().equals(groupId)) {
            throw new ResourceNotFoundException("Expense", "id", expenseId);
        }
        return expense;
    }

    private ExpenseResponse buildExpenseResponse(Expense expense) {
        List<ExpenseSplitResponse> splitResponses = expenseSplitRepository
                .findByExpenseId(expense.getId()).stream()
                .map(s -> ExpenseSplitResponse.builder()
                        .id(s.getId())
                        .userId(s.getUser().getId())
                        .fullName(s.getUser().getFullName())
                        .avatarColor(s.getUser().getAvatarColor())
                        .amount(s.getAmount())
                        .shareValue(s.getShareValue())
                        .build())
                .toList();

        return ExpenseResponse.builder()
                .id(expense.getId())
                .groupId(expense.getGroup().getId())
                .paidBy(UserResponse.builder()
                        .id(expense.getPaidBy().getId())
                        .fullName(expense.getPaidBy().getFullName())
                        .email(expense.getPaidBy().getEmail())
                        .avatarColor(expense.getPaidBy().getAvatarColor())
                        .build())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .category(expense.getCategory())
                .expenseDate(expense.getExpenseDate())
                .splitType(expense.getSplitType())
                .splits(splitResponses)
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
