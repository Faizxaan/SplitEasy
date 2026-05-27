package com.spliteasy.service.impl;

import com.spliteasy.dto.response.MemberBalanceResponse;
import com.spliteasy.dto.response.MemberResponse;
import com.spliteasy.dto.response.SimplifiedDebtResponse;
import com.spliteasy.entity.GroupMember;
import com.spliteasy.entity.User;
import com.spliteasy.exception.ForbiddenException;
import com.spliteasy.exception.ResourceNotFoundException;
import com.spliteasy.repository.*;
import com.spliteasy.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BalanceServiceImpl implements BalanceService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final SettlementRepository settlementRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MemberBalanceResponse> getGroupBalances(UUID groupId, User currentUser) {
        verifyGroupMembership(groupId, currentUser);
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);

        return members.stream().map(gm -> {
            User user = gm.getUser();
            BigDecimal totalPaid = nullSafe(expenseRepository.sumPaidByUserInGroup(groupId, user.getId()));
            BigDecimal totalOwed = nullSafe(expenseSplitRepository.sumOwedAmountByGroupIdAndUserId(groupId, user.getId()));
            BigDecimal settledOut = nullSafe(settlementRepository.sumPaidByUserInGroup(groupId, user.getId()));
            BigDecimal settledIn = nullSafe(settlementRepository.sumReceivedByUserInGroup(groupId, user.getId()));
            BigDecimal netBalance = totalPaid.subtract(totalOwed).add(settledOut).subtract(settledIn);
            return MemberBalanceResponse.builder()
                    .user(MemberResponse.builder()
                            .id(user.getId())
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .avatarColor(user.getAvatarColor())
                            .netBalance(netBalance)
                            .build())
                    .totalPaid(totalPaid)
                    .totalOwed(totalOwed)
                    .netBalance(netBalance)
                    .build();
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SimplifiedDebtResponse> getSimplifiedDebts(UUID groupId, User currentUser) {
        verifyGroupMembership(groupId, currentUser);
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        Map<UUID, User> userMap = members.stream()
                .collect(java.util.stream.Collectors.toMap(gm -> gm.getUser().getId(), GroupMember::getUser));

        Map<UUID, BigDecimal> netBalances = new HashMap<>();
        for (User user : userMap.values()) {
            BigDecimal totalPaid = nullSafe(expenseRepository.sumPaidByUserInGroup(groupId, user.getId()));
            BigDecimal totalOwed = nullSafe(expenseSplitRepository.sumOwedAmountByGroupIdAndUserId(groupId, user.getId()));
            BigDecimal settledOut = nullSafe(settlementRepository.sumPaidByUserInGroup(groupId, user.getId()));
            BigDecimal settledIn = nullSafe(settlementRepository.sumReceivedByUserInGroup(groupId, user.getId()));
            BigDecimal net = totalPaid.subtract(totalOwed).add(settledOut).subtract(settledIn).setScale(2, RoundingMode.HALF_UP);
            if (net.abs().compareTo(new BigDecimal("0.01")) >= 0) {
                netBalances.put(user.getId(), net);
            }
        }

        return simplifyDebts(netBalances, userMap);
    }

    private List<SimplifiedDebtResponse> simplifyDebts(Map<UUID, BigDecimal> netBalances, Map<UUID, User> userMap) {
        PriorityQueue<Map.Entry<UUID, BigDecimal>> creditors = new PriorityQueue<>(
                (a, b) -> b.getValue().compareTo(a.getValue()));
        PriorityQueue<Map.Entry<UUID, BigDecimal>> debtors = new PriorityQueue<>(
                (a, b) -> a.getValue().compareTo(b.getValue()));

        for (Map.Entry<UUID, BigDecimal> entry : netBalances.entrySet()) {
            if (entry.getValue().compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()));
            } else if (entry.getValue().compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()));
            }
        }

        List<SimplifiedDebtResponse> transactions = new ArrayList<>();
        while (!creditors.isEmpty() && !debtors.isEmpty()) {
            Map.Entry<UUID, BigDecimal> creditor = creditors.poll();
            Map.Entry<UUID, BigDecimal> debtor = debtors.poll();

            BigDecimal creditAmount = creditor.getValue();
            BigDecimal debtAmount = debtor.getValue().abs();
            BigDecimal transfer = creditAmount.min(debtAmount).setScale(2, RoundingMode.HALF_UP);

            User fromUser = userMap.get(debtor.getKey());
            User toUser = userMap.get(creditor.getKey());

            transactions.add(SimplifiedDebtResponse.builder()
                    .from(MemberResponse.builder()
                            .id(fromUser.getId())
                            .fullName(fromUser.getFullName())
                            .email(fromUser.getEmail())
                            .avatarColor(fromUser.getAvatarColor())
                            .netBalance(debtor.getValue())
                            .build())
                    .to(MemberResponse.builder()
                            .id(toUser.getId())
                            .fullName(toUser.getFullName())
                            .email(toUser.getEmail())
                            .avatarColor(toUser.getAvatarColor())
                            .netBalance(creditor.getValue())
                            .build())
                    .amount(transfer)
                    .build());

            BigDecimal remainingCredit = creditAmount.subtract(transfer);
            BigDecimal remainingDebt = debtAmount.subtract(transfer);

            if (remainingCredit.compareTo(BigDecimal.valueOf(0.01)) > 0) {
                creditors.add(new AbstractMap.SimpleEntry<>(creditor.getKey(), remainingCredit));
            }
            if (remainingDebt.compareTo(BigDecimal.valueOf(0.01)) > 0) {
                debtors.add(new AbstractMap.SimpleEntry<>(debtor.getKey(), remainingDebt.negate()));
            }
        }

        return transactions;
    }

    private void verifyGroupMembership(UUID groupId, User currentUser) {
        if (!groupRepository.existsById(groupId)) {
            throw new ResourceNotFoundException("Group", "id", groupId);
        }
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUser.getId())) {
            throw new ForbiddenException("You are not a member of this group");
        }
    }

    private BigDecimal nullSafe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
