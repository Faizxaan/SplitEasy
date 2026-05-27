package com.spliteasy.controller;

import com.spliteasy.dto.response.MemberBalanceResponse;
import com.spliteasy.dto.response.SimplifiedDebtResponse;
import com.spliteasy.entity.User;
import com.spliteasy.security.SecurityUtils;
import com.spliteasy.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/balances")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;

    @GetMapping
    public ResponseEntity<List<MemberBalanceResponse>> getGroupBalances(@PathVariable UUID groupId) {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(balanceService.getGroupBalances(groupId, currentUser));
    }

    @GetMapping("/simplified")
    public ResponseEntity<List<SimplifiedDebtResponse>> getSimplifiedDebts(@PathVariable UUID groupId) {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(balanceService.getSimplifiedDebts(groupId, currentUser));
    }
}
