package com.spliteasy.service.impl;

import com.spliteasy.dto.request.CreateSettlementRequest;
import com.spliteasy.dto.response.SettlementResponse;
import com.spliteasy.dto.response.UserResponse;
import com.spliteasy.entity.Group;
import com.spliteasy.entity.Settlement;
import com.spliteasy.entity.User;
import com.spliteasy.exception.BadRequestException;
import com.spliteasy.exception.ForbiddenException;
import com.spliteasy.exception.ResourceNotFoundException;
import com.spliteasy.repository.*;
import com.spliteasy.service.SettlementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettlementServiceImpl implements SettlementService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final SettlementRepository settlementRepository;

    @Override
    @Transactional
    public SettlementResponse createSettlement(UUID groupId, CreateSettlementRequest request, User currentUser) {
        Group group = findGroupAndVerifyMembership(groupId, currentUser);
        User paidTo = userRepository.findById(request.getPaidToId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getPaidToId()));
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, paidTo.getId())) {
            throw new BadRequestException("The recipient must be a member of the group");
        }
        if (currentUser.getId().equals(paidTo.getId())) {
            throw new BadRequestException("Cannot settle with yourself");
        }

        LocalDateTime settledAt = request.getSettledAt() != null ? request.getSettledAt() : LocalDateTime.now();
        Settlement settlement = Settlement.builder()
                .group(group)
                .paidBy(currentUser)
                .paidTo(paidTo)
                .amount(request.getAmount().setScale(2, RoundingMode.HALF_UP))
                .note(request.getNote())
                .settledAt(settledAt)
                .build();
        settlementRepository.save(settlement);
        log.info("Settlement recorded: {} paid {} to {}", currentUser.getEmail(), request.getAmount(), paidTo.getEmail());
        return buildSettlementResponse(settlement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SettlementResponse> getGroupSettlements(UUID groupId, User currentUser) {
        findGroupAndVerifyMembership(groupId, currentUser);
        return settlementRepository.findByGroupIdOrderBySettledAtDesc(groupId).stream()
                .map(this::buildSettlementResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteSettlement(UUID groupId, UUID settlementId, User currentUser) {
        findGroupAndVerifyMembership(groupId, currentUser);
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement", "id", settlementId));
        if (!settlement.getGroup().getId().equals(groupId)) {
            throw new ResourceNotFoundException("Settlement", "id", settlementId);
        }
        if (!settlement.getPaidBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the payer can undo a settlement");
        }
        settlementRepository.delete(settlement);
    }

    private Group findGroupAndVerifyMembership(UUID groupId, User currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUser.getId())) {
            throw new ForbiddenException("You are not a member of this group");
        }
        return group;
    }

    private SettlementResponse buildSettlementResponse(Settlement settlement) {
        return SettlementResponse.builder()
                .id(settlement.getId())
                .groupId(settlement.getGroup().getId())
                .paidBy(toUserResponse(settlement.getPaidBy()))
                .paidTo(toUserResponse(settlement.getPaidTo()))
                .amount(settlement.getAmount())
                .note(settlement.getNote())
                .settledAt(settlement.getSettledAt())
                .createdAt(settlement.getCreatedAt())
                .build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarColor(user.getAvatarColor())
                .build();
    }
}
