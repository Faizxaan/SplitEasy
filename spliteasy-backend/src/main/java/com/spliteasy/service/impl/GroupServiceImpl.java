package com.spliteasy.service.impl;

import com.spliteasy.dto.request.CreateGroupRequest;
import com.spliteasy.dto.request.UpdateGroupRequest;
import com.spliteasy.dto.response.*;
import com.spliteasy.entity.Group;
import com.spliteasy.entity.GroupMember;
import com.spliteasy.entity.User;
import com.spliteasy.exception.BadRequestException;
import com.spliteasy.exception.ConflictException;
import com.spliteasy.exception.ForbiddenException;
import com.spliteasy.exception.ResourceNotFoundException;
import com.spliteasy.repository.*;
import com.spliteasy.service.GroupService;
import com.spliteasy.util.InviteCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final SettlementRepository settlementRepository;

    @Override
    @Transactional
    public GroupDetailResponse createGroup(CreateGroupRequest request, User currentUser) {
        String inviteCode;
        do {
            inviteCode = InviteCodeGenerator.generate();
        } while (groupRepository.existsByInviteCode(inviteCode));

        Group group = Group.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .category(request.getCategory())
                .currency(request.getCurrency() != null ? request.getCurrency() : com.spliteasy.enums.Currency.INR)
                .inviteCode(inviteCode)
                .createdBy(currentUser)
                .build();
        groupRepository.save(group);

        GroupMember member = GroupMember.builder().group(group).user(currentUser).build();
        groupMemberRepository.save(member);

        log.info("Group '{}' created by user {}", group.getName(), currentUser.getEmail());
        return buildGroupDetail(group, currentUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupSummaryResponse> getUserGroups(User currentUser) {
        return groupRepository.findGroupsByMemberId(currentUser.getId()).stream()
                .map(group -> buildGroupSummary(group, currentUser))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GroupDetailResponse getGroupDetail(UUID groupId, User currentUser) {
        Group group = findGroupAndVerifyMembership(groupId, currentUser);
        return buildGroupDetail(group, currentUser);
    }

    @Override
    @Transactional
    public GroupDetailResponse updateGroup(UUID groupId, UpdateGroupRequest request, User currentUser) {
        Group group = findGroupAndVerifyMembership(groupId, currentUser);
        if (!group.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the group creator can update the group");
        }
        if (request.getName() != null) group.setName(request.getName().trim());
        if (request.getDescription() != null) group.setDescription(request.getDescription().trim());
        if (request.getCategory() != null) group.setCategory(request.getCategory());
        groupRepository.save(group);
        return buildGroupDetail(group, currentUser);
    }

    @Override
    @Transactional
    public void deleteGroup(UUID groupId, User currentUser) {
        Group group = findGroupAndVerifyMembership(groupId, currentUser);
        if (!group.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the group creator can delete the group");
        }
        settlementRepository.deleteByGroupId(groupId);
        groupRepository.delete(group);
        log.info("Group '{}' deleted by user {}", group.getName(), currentUser.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public GroupPreviewResponse getGroupPreview(String inviteCode) {
        Group group = groupRepository.findByInviteCode(inviteCode.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Group", "inviteCode", inviteCode));
        long memberCount = groupMemberRepository.countMembersByGroupId(group.getId());
        return GroupPreviewResponse.builder()
                .name(group.getName())
                .description(group.getDescription())
                .category(group.getCategory())
                .currency(group.getCurrency())
                .memberCount((int) memberCount)
                .build();
    }

    @Override
    @Transactional
    public GroupDetailResponse joinGroup(String inviteCode, User currentUser) {
        Group group = groupRepository.findByInviteCode(inviteCode.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Group", "inviteCode", inviteCode));
        if (groupMemberRepository.existsByGroupIdAndUserId(group.getId(), currentUser.getId())) {
            // User is already a member — return group detail so the client can redirect them
            log.info("User {} is already a member of group '{}'", currentUser.getEmail(), group.getName());
            return buildGroupDetail(group, currentUser);
        }
        GroupMember member = GroupMember.builder().group(group).user(currentUser).build();
        groupMemberRepository.save(member);
        log.info("User {} joined group '{}'", currentUser.getEmail(), group.getName());
        return buildGroupDetail(group, currentUser);
    }

    @Override
    @Transactional
    public void leaveGroup(UUID groupId, User currentUser) {
        Group group = findGroupAndVerifyMembership(groupId, currentUser);
        if (group.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Group creator cannot leave the group. Delete the group instead.");
        }
        BigDecimal netBalance = calculateUserNetBalance(groupId, currentUser.getId());
        if (netBalance.compareTo(BigDecimal.ZERO) != 0) {
            throw new BadRequestException("You have unsettled balances in this group. Please settle up before leaving.");
        }
        groupMemberRepository.deleteByGroupIdAndUserId(groupId, currentUser.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberResponse> getGroupMembers(UUID groupId, User currentUser) {
        findGroupAndVerifyMembership(groupId, currentUser);
        return groupMemberRepository.findByGroupId(groupId).stream()
                .map(gm -> buildMemberResponse(gm.getUser(), groupId))
                .toList();
    }

    private Group findGroupAndVerifyMembership(UUID groupId, User currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUser.getId())) {
            throw new ForbiddenException("You are not a member of this group");
        }
        return group;
    }

    private GroupSummaryResponse buildGroupSummary(Group group, User currentUser) {
        long memberCount = groupMemberRepository.countMembersByGroupId(group.getId());
        BigDecimal totalExpenses = expenseRepository.sumAmountByGroupId(group.getId());
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;
        BigDecimal userBalance = calculateUserNetBalance(group.getId(), currentUser.getId());
        return GroupSummaryResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .category(group.getCategory())
                .currency(group.getCurrency())
                .inviteCode(group.getInviteCode())
                .memberCount((int) memberCount)
                .totalExpenses(totalExpenses)
                .userBalance(userBalance)
                .createdAt(group.getCreatedAt())
                .build();
    }

    private GroupDetailResponse buildGroupDetail(Group group, User currentUser) {
        List<MemberResponse> members = groupMemberRepository.findByGroupId(group.getId()).stream()
                .map(gm -> buildMemberResponse(gm.getUser(), group.getId()))
                .toList();
        BigDecimal totalExpenses = expenseRepository.sumAmountByGroupId(group.getId());
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;
        UserResponse createdBy = UserResponse.builder()
                .id(group.getCreatedBy().getId())
                .fullName(group.getCreatedBy().getFullName())
                .email(group.getCreatedBy().getEmail())
                .avatarColor(group.getCreatedBy().getAvatarColor())
                .build();
        return GroupDetailResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .category(group.getCategory())
                .currency(group.getCurrency())
                .inviteCode(group.getInviteCode())
                .createdBy(createdBy)
                .members(members)
                .totalExpenses(totalExpenses)
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }

    private MemberResponse buildMemberResponse(User user, UUID groupId) {
        BigDecimal netBalance = calculateUserNetBalance(groupId, user.getId());
        return MemberResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarColor(user.getAvatarColor())
                .netBalance(netBalance)
                .build();
    }

    private BigDecimal calculateUserNetBalance(UUID groupId, UUID userId) {
        BigDecimal totalPaid = expenseRepository.sumPaidByUserInGroup(groupId, userId);
        BigDecimal totalOwed = expenseSplitRepository.sumOwedAmountByGroupIdAndUserId(groupId, userId);
        BigDecimal settledOut = settlementRepository.sumPaidByUserInGroup(groupId, userId);
        BigDecimal settledIn = settlementRepository.sumReceivedByUserInGroup(groupId, userId);
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;
        if (totalOwed == null) totalOwed = BigDecimal.ZERO;
        if (settledOut == null) settledOut = BigDecimal.ZERO;
        if (settledIn == null) settledIn = BigDecimal.ZERO;
        return totalPaid.subtract(totalOwed).add(settledOut).subtract(settledIn);
    }
}
