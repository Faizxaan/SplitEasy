package com.spliteasy.controller;

import com.spliteasy.dto.request.CreateSettlementRequest;
import com.spliteasy.dto.response.SettlementResponse;
import com.spliteasy.entity.User;
import com.spliteasy.security.SecurityUtils;
import com.spliteasy.service.SettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @PostMapping
    public ResponseEntity<SettlementResponse> createSettlement(
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateSettlementRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(settlementService.createSettlement(groupId, request, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<SettlementResponse>> getGroupSettlements(@PathVariable UUID groupId) {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(settlementService.getGroupSettlements(groupId, currentUser));
    }

    @DeleteMapping("/{settlementId}")
    public ResponseEntity<Void> deleteSettlement(
            @PathVariable UUID groupId,
            @PathVariable UUID settlementId) {
        User currentUser = SecurityUtils.getCurrentUser();
        settlementService.deleteSettlement(groupId, settlementId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
