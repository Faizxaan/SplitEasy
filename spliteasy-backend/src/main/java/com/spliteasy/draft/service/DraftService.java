package com.spliteasy.draft.service;

import com.spliteasy.draft.dto.*;
import com.spliteasy.draft.entity.DraftExpense;
import com.spliteasy.draft.entity.DraftExpenseSplit;
import com.spliteasy.draft.entity.DraftParticipant;
import com.spliteasy.draft.entity.DraftSession;
import com.spliteasy.draft.repository.DraftExpenseRepository;
import com.spliteasy.draft.repository.DraftExpenseSplitRepository;
import com.spliteasy.draft.repository.DraftParticipantRepository;
import com.spliteasy.draft.repository.DraftSessionRepository;
import com.spliteasy.entity.User;
import com.spliteasy.exception.ForbiddenException;
import com.spliteasy.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DraftService {

    private final DraftSessionRepository sessionRepository;
    private final DraftParticipantRepository participantRepository;
    private final DraftExpenseRepository expenseRepository;
    private final DraftExpenseSplitRepository expenseSplitRepository;

    private static final String[] AVATAR_COLORS = {
        "#6366F1", "#EF4444", "#F59E0B", "#10B981", "#3B82F6",
        "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#84CC16"
    };

    /* ── Create / List / Delete session ──────────────────────────────── */

    @Transactional
    public DraftSessionResponse createSession(CreateDraftSessionRequest req, User creator) {
        String currency = (req.getCurrency() == null || req.getCurrency().isBlank()) ? "INR" : req.getCurrency().toUpperCase();
        DraftSession session = DraftSession.builder()
                .title(req.getTitle().trim())
                .currency(currency)
                .createdBy(creator)
                .shareToken(UUID.randomUUID().toString().replace("-", ""))
                .build();
        session = sessionRepository.save(session);

        DraftParticipant creatorParticipant = DraftParticipant.builder()
                .draftSession(session)
                .displayName(creator.getFullName())
                .avatarColor(creator.getAvatarColor() != null ? creator.getAvatarColor() : AVATAR_COLORS[0])
                .isCreator(true)
                .build();
        participantRepository.save(creatorParticipant);

        return toFullResponse(session);
    }

    @Transactional(readOnly = true)
    public List<DraftSessionSummaryResponse> listSessions(User creator) {
        return sessionRepository.findByCreatedByIdOrderByCreatedAtDesc(creator.getId())
                .stream().map(this::toSummaryResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DraftSessionResponse getSession(UUID sessionId, User currentUser) {
        DraftSession session = findAndAuthorize(sessionId, currentUser);
        return toFullResponse(session);
    }

    @Transactional
    public DraftSessionResponse updateSession(UUID sessionId, CreateDraftSessionRequest req, User currentUser) {
        DraftSession session = findAndAuthorize(sessionId, currentUser);
        if (req.getTitle() != null && !req.getTitle().isBlank()) {
            session.setTitle(req.getTitle().trim());
        }
        if (req.getCurrency() != null && !req.getCurrency().isBlank()) {
            session.setCurrency(req.getCurrency().toUpperCase());
        }
        sessionRepository.save(session);
        return toFullResponse(session);
    }

    @Transactional
    public void deleteSession(UUID sessionId, User currentUser) {
        DraftSession session = findAndAuthorize(sessionId, currentUser);
        sessionRepository.delete(session);
    }

    /* ── Participants ─────────────────────────────────────────────────── */

    @Transactional
    public DraftParticipantResponse addParticipant(UUID sessionId, AddDraftParticipantRequest req, User currentUser) {
        DraftSession session = findAndAuthorize(sessionId, currentUser);
        String name = req.getDisplayName().trim();
        if (participantRepository.existsByDraftSessionIdAndDisplayNameIgnoreCase(sessionId, name)) {
            throw new IllegalArgumentException("A participant named '" + name + "' already exists in this session.");
        }
        List<DraftParticipant> existing = participantRepository.findByDraftSessionId(sessionId);
        String color = AVATAR_COLORS[existing.size() % AVATAR_COLORS.length];

        DraftParticipant p = DraftParticipant.builder()
                .draftSession(session)
                .displayName(name)
                .avatarColor(color)
                .isCreator(false)
                .build();
        participantRepository.save(p);
        return toParticipantResponse(p);
    }

    @Transactional
    public void removeParticipant(UUID sessionId, UUID participantId, User currentUser) {
        findAndAuthorize(sessionId, currentUser);
        DraftParticipant p = participantRepository.findById(participantId)
                .orElseThrow(() -> new ResourceNotFoundException("DraftParticipant", "id", participantId));
        if (!p.getDraftSession().getId().equals(sessionId)) {
            throw new ForbiddenException("Participant does not belong to this session");
        }
        if (p.isCreator()) {
            throw new ForbiddenException("Cannot remove the session creator");
        }
        expenseSplitRepository.deleteByParticipantIdAndSessionId(participantId, sessionId);
        participantRepository.delete(p);

        List<DraftExpense> expenses = expenseRepository.findByDraftSessionIdOrderByExpenseDateDesc(sessionId);
        for (DraftExpense expense : expenses) {
            if (!"EQUAL".equals(expense.getSplitType())) continue;
            List<DraftExpenseSplit> remaining = expenseSplitRepository.findByDraftExpenseId(expense.getId());
            if (remaining.isEmpty()) continue;
            BigDecimal newShare = expense.getAmount()
                    .divide(BigDecimal.valueOf(remaining.size()), 2, RoundingMode.HALF_UP);
            for (DraftExpenseSplit split : remaining) {
                split.setShareValue(newShare);
            }
            expenseSplitRepository.saveAll(remaining);
        }
    }

    /* ── Expenses ─────────────────────────────────────────────────────── */

    @Transactional
    public DraftExpenseResponse addExpense(UUID sessionId, CreateDraftExpenseRequest req, User currentUser) {
        DraftSession session = findAndAuthorize(sessionId, currentUser);
        List<DraftParticipant> participants = participantRepository.findByDraftSessionId(sessionId);

        DraftExpense expense = DraftExpense.builder()
                .draftSession(session)
                .description(req.getDescription().trim())
                .amount(req.getAmount().setScale(2, RoundingMode.HALF_UP))
                .category(req.getCategory() != null ? req.getCategory() : "OTHER")
                .expenseDate(req.getExpenseDate() != null ? req.getExpenseDate() : LocalDate.now())
                .splitType(req.getSplitType() != null ? req.getSplitType().toUpperCase() : "EQUAL")
                .paidByParticipantId(req.getPaidByParticipantId())
                .build();
        expense = expenseRepository.save(expense);

        List<DraftExpenseSplit> splits = buildSplits(expense, req, participants);
        expense.setSplits(splits);
        expense = expenseRepository.save(expense);

        return toExpenseResponse(expense, participants);
    }

    @Transactional
    public DraftExpenseResponse updateExpense(UUID sessionId, UUID expenseId, CreateDraftExpenseRequest req, User currentUser) {
        findAndAuthorize(sessionId, currentUser);
        DraftExpense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("DraftExpense", "id", expenseId));
        if (!expense.getDraftSession().getId().equals(sessionId)) {
            throw new ForbiddenException("Expense does not belong to this session");
        }
        List<DraftParticipant> participants = participantRepository.findByDraftSessionId(sessionId);

        expense.setDescription(req.getDescription().trim());
        expense.setAmount(req.getAmount().setScale(2, RoundingMode.HALF_UP));
        expense.setCategory(req.getCategory() != null ? req.getCategory() : expense.getCategory());
        expense.setExpenseDate(req.getExpenseDate() != null ? req.getExpenseDate() : expense.getExpenseDate());
        expense.setSplitType(req.getSplitType() != null ? req.getSplitType().toUpperCase() : expense.getSplitType());
        expense.setPaidByParticipantId(req.getPaidByParticipantId());
        expense.getSplits().clear();
        expense.getSplits().addAll(buildSplits(expense, req, participants));
        expense = expenseRepository.save(expense);

        return toExpenseResponse(expense, participants);
    }

    @Transactional
    public void deleteExpense(UUID sessionId, UUID expenseId, User currentUser) {
        findAndAuthorize(sessionId, currentUser); // verify ownership
        DraftExpense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("DraftExpense", "id", expenseId));
        if (!expense.getDraftSession().getId().equals(sessionId)) {
            throw new ForbiddenException("Expense does not belong to this session");
        }
        expenseRepository.delete(expense);
    }

    /* ── Settlements ─────────────────────────────────────────────────── */

    @Transactional(readOnly = true)
    public List<DraftDebtResponse> getSettlements(UUID sessionId, User currentUser) {
        findAndAuthorize(sessionId, currentUser);
        return computeSettlements(sessionId);
    }

    /* ── Public share ──────────────────────────────────────────────────── */

    @Transactional(readOnly = true)
    public DraftSessionResponse getByShareToken(String shareToken) {
        DraftSession session = sessionRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new ResourceNotFoundException("DraftSession", "shareToken", shareToken));
        return toFullResponse(session);
    }

    /* ── Internal helpers ─────────────────────────────────────────────── */

    private DraftSession findAndAuthorize(UUID sessionId, User currentUser) {
        DraftSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("DraftSession", "id", sessionId));
        if (!session.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not own this draft session");
        }
        return session;
    }

    private List<DraftExpenseSplit> buildSplits(DraftExpense expense, CreateDraftExpenseRequest req, List<DraftParticipant> allParticipants) {
        List<UUID> participantIds;
        String splitType = expense.getSplitType();

        if (req.getSplits() != null && !req.getSplits().isEmpty()) {
            participantIds = req.getSplits().stream().map(DraftSplitItemRequest::getParticipantId).collect(Collectors.toList());
        } else {
            participantIds = allParticipants.stream().map(p -> p.getId()).collect(Collectors.toList());
        }

        int count = participantIds.size();
        if (count == 0) count = 1;
        BigDecimal equalShare = expense.getAmount().divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);

        List<DraftExpenseSplit> splits = new ArrayList<>();
        for (int i = 0; i < participantIds.size(); i++) {
            UUID pid = participantIds.get(i);
            BigDecimal shareValue = null;
            if (req.getSplits() != null && !req.getSplits().isEmpty()) {
                DraftSplitItemRequest item = req.getSplits().stream()
                        .filter(s -> s.getParticipantId().equals(pid)).findFirst().orElse(null);
                if (item != null) shareValue = item.getShareValue();
            }
            DraftExpenseSplit split = DraftExpenseSplit.builder()
                    .draftExpense(expense)
                    .participantId(pid)
                    .shareValue("EQUAL".equals(splitType) ? equalShare : shareValue)
                    .build();
            splits.add(split);
        }
        return splits;
    }

    private List<DraftDebtResponse> computeSettlements(UUID sessionId) {
        List<DraftParticipant> participants = participantRepository.findByDraftSessionId(sessionId);
        List<DraftExpense> expenses = expenseRepository.findByDraftSessionIdOrderByExpenseDateDesc(sessionId);
        Map<UUID, DraftParticipant> pMap = participants.stream().collect(Collectors.toMap(p -> p.getId(), p -> p));

        Map<UUID, BigDecimal> net = new HashMap<>();
        for (DraftParticipant p : participants) net.put(p.getId(), BigDecimal.ZERO);

        for (DraftExpense exp : expenses) {
            UUID payerId = exp.getPaidByParticipantId();
            if (pMap.containsKey(payerId)) {
                net.merge(payerId, exp.getAmount(), BigDecimal::add);
            }

            for (DraftExpenseSplit split : exp.getSplits()) {
                if (!pMap.containsKey(split.getParticipantId())) continue;
                BigDecimal share = resolveShare(exp, split, exp.getSplits());
                net.merge(split.getParticipantId(), share.negate(), BigDecimal::add);
            }
        }

        PriorityQueue<Map.Entry<UUID, BigDecimal>> creditors = new PriorityQueue<>(
                (a, b) -> b.getValue().compareTo(a.getValue()));
        PriorityQueue<Map.Entry<UUID, BigDecimal>> debtors = new PriorityQueue<>(
                (a, b) -> a.getValue().compareTo(b.getValue()));

        for (Map.Entry<UUID, BigDecimal> entry : net.entrySet()) {
            BigDecimal val = entry.getValue().setScale(2, RoundingMode.HALF_UP);
            if (val.compareTo(new BigDecimal("0.01")) > 0) {
                creditors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), val));
            } else if (val.compareTo(new BigDecimal("-0.01")) < 0) {
                debtors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), val));
            }
        }

        List<DraftDebtResponse> result = new ArrayList<>();
        while (!creditors.isEmpty() && !debtors.isEmpty()) {
            Map.Entry<UUID, BigDecimal> creditor = creditors.poll();
            Map.Entry<UUID, BigDecimal> debtor = debtors.poll();
            BigDecimal transfer = creditor.getValue().min(debtor.getValue().abs()).setScale(2, RoundingMode.HALF_UP);

            result.add(DraftDebtResponse.builder()
                    .from(toParticipantResponse(pMap.get(debtor.getKey())))
                    .to(toParticipantResponse(pMap.get(creditor.getKey())))
                    .amount(transfer)
                    .build());

            BigDecimal remCredit = creditor.getValue().subtract(transfer);
            BigDecimal remDebt = debtor.getValue().abs().subtract(transfer);
            if (remCredit.compareTo(new BigDecimal("0.01")) > 0) creditors.add(new AbstractMap.SimpleEntry<>(creditor.getKey(), remCredit));
            if (remDebt.compareTo(new BigDecimal("0.01")) > 0) debtors.add(new AbstractMap.SimpleEntry<>(debtor.getKey(), remDebt.negate()));
        }
        return result;
    }

    private BigDecimal resolveShare(DraftExpense exp, DraftExpenseSplit split, List<DraftExpenseSplit> allSplits) {
        if ("EQUAL".equals(exp.getSplitType()) || split.getShareValue() != null) {
            return split.getShareValue() != null ? split.getShareValue() : BigDecimal.ZERO;
        }
        if ("PERCENTAGE".equals(exp.getSplitType()) && split.getShareValue() != null) {
            return exp.getAmount().multiply(split.getShareValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        if ("SHARES".equals(exp.getSplitType())) {
            BigDecimal total = allSplits.stream().map(s -> s.getShareValue() != null ? s.getShareValue() : BigDecimal.ONE)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal myShare = split.getShareValue() != null ? split.getShareValue() : BigDecimal.ONE;
            if (total.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
            return exp.getAmount().multiply(myShare).divide(total, 2, RoundingMode.HALF_UP);
        }
        return split.getShareValue() != null ? split.getShareValue() : BigDecimal.ZERO;
    }

    /* ── Mappers ─────────────────────────────────────────────────────── */

    private DraftSessionResponse toFullResponse(DraftSession session) {
        List<DraftParticipant> participants = participantRepository.findByDraftSessionId(session.getId());
        List<DraftExpense> expenses = expenseRepository.findByDraftSessionIdOrderByExpenseDateDesc(session.getId());
        BigDecimal total = expenses.stream().map(DraftExpense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        List<DraftDebtResponse> settlements = computeSettlements(session.getId());

        return DraftSessionResponse.builder()
                .id(session.getId())
                .title(session.getTitle())
                .currency(session.getCurrency())
                .shareToken(session.getShareToken())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .participants(participants.stream().map(this::toParticipantResponse).collect(Collectors.toList()))
                .expenses(expenses.stream().map(e -> toExpenseResponse(e, participants)).collect(Collectors.toList()))
                .totalAmount(total.setScale(2, RoundingMode.HALF_UP))
                .settlements(settlements)
                .build();
    }

    private DraftSessionSummaryResponse toSummaryResponse(DraftSession session) {
        List<DraftExpense> expenses = expenseRepository.findByDraftSessionIdOrderByExpenseDateDesc(session.getId());
        BigDecimal total = expenses.stream().map(DraftExpense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        int participantCount = participantRepository.findByDraftSessionId(session.getId()).size();
        return DraftSessionSummaryResponse.builder()
                .id(session.getId())
                .title(session.getTitle())
                .currency(session.getCurrency())
                .shareToken(session.getShareToken())
                .participantCount(participantCount)
                .expenseCount(expenses.size())
                .totalAmount(total.setScale(2, RoundingMode.HALF_UP))
                .createdAt(session.getCreatedAt())
                .build();
    }

    public DraftParticipantResponse toParticipantResponse(DraftParticipant p) {
        return DraftParticipantResponse.builder()
                .id(p.getId())
                .displayName(p.getDisplayName())
                .avatarColor(p.getAvatarColor())
                .isCreator(p.isCreator())
                .build();
    }

    private DraftExpenseResponse toExpenseResponse(DraftExpense e, List<DraftParticipant> participants) {
        Map<UUID, String> nameMap = participants.stream().collect(Collectors.toMap(p -> p.getId(), DraftParticipant::getDisplayName));
        List<DraftExpenseSplitResponse> splits = e.getSplits().stream().map(s -> {
            BigDecimal computed = resolveShare(e, s, e.getSplits());
            return DraftExpenseSplitResponse.builder()
                    .participantId(s.getParticipantId())
                    .shareValue(s.getShareValue())
                    .computedAmount(computed)
                    .build();
        }).collect(Collectors.toList());

        return DraftExpenseResponse.builder()
                .id(e.getId())
                .description(e.getDescription())
                .amount(e.getAmount())
                .category(e.getCategory())
                .expenseDate(e.getExpenseDate())
                .splitType(e.getSplitType())
                .paidByParticipantId(e.getPaidByParticipantId())
                .paidByParticipantName(nameMap.getOrDefault(e.getPaidByParticipantId(), "Unknown"))
                .splits(splits)
                .build();
    }
}
