package com.spliteasy.draft.controller;

import com.spliteasy.draft.dto.*;
import com.spliteasy.draft.service.DraftService;
import com.spliteasy.entity.User;
import com.spliteasy.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quick-splits")
@RequiredArgsConstructor
public class QuickSplitController {

    private final DraftService draftService;

    @PostMapping
    public ResponseEntity<DraftSessionResponse> createSession(@Valid @RequestBody CreateDraftSessionRequest req) {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(draftService.createSession(req, user));
    }

    @GetMapping
    public ResponseEntity<List<DraftSessionSummaryResponse>> listSessions() {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(draftService.listSessions(user));
    }

    @GetMapping("/{draftId}")
    public ResponseEntity<DraftSessionResponse> getSession(@PathVariable UUID draftId) {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(draftService.getSession(draftId, user));
    }

    @PatchMapping("/{draftId}")
    public ResponseEntity<DraftSessionResponse> updateSession(
            @PathVariable UUID draftId,
            @RequestBody CreateDraftSessionRequest req) {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(draftService.updateSession(draftId, req, user));
    }

    @DeleteMapping("/{draftId}")
    public ResponseEntity<Void> deleteSession(@PathVariable UUID draftId) {
        User user = SecurityUtils.getCurrentUser();
        draftService.deleteSession(draftId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{draftId}/participants")
    public ResponseEntity<DraftParticipantResponse> addParticipant(
            @PathVariable UUID draftId,
            @Valid @RequestBody AddDraftParticipantRequest req) {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(draftService.addParticipant(draftId, req, user));
    }

    @DeleteMapping("/{draftId}/participants/{participantId}")
    public ResponseEntity<Void> removeParticipant(
            @PathVariable UUID draftId,
            @PathVariable UUID participantId) {
        User user = SecurityUtils.getCurrentUser();
        draftService.removeParticipant(draftId, participantId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{draftId}/expenses")
    public ResponseEntity<DraftExpenseResponse> addExpense(
            @PathVariable UUID draftId,
            @Valid @RequestBody CreateDraftExpenseRequest req) {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(draftService.addExpense(draftId, req, user));
    }

    @PutMapping("/{draftId}/expenses/{expenseId}")
    public ResponseEntity<DraftExpenseResponse> updateExpense(
            @PathVariable UUID draftId,
            @PathVariable UUID expenseId,
            @Valid @RequestBody CreateDraftExpenseRequest req) {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(draftService.updateExpense(draftId, expenseId, req, user));
    }

    @DeleteMapping("/{draftId}/expenses/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable UUID draftId,
            @PathVariable UUID expenseId) {
        User user = SecurityUtils.getCurrentUser();
        draftService.deleteExpense(draftId, expenseId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{draftId}/settlements")
    public ResponseEntity<List<DraftDebtResponse>> getSettlements(@PathVariable UUID draftId) {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(draftService.getSettlements(draftId, user));
    }
}
