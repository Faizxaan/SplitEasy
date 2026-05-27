package com.spliteasy.controller;

import com.spliteasy.dto.request.CreateExpenseRequest;
import com.spliteasy.dto.response.ExpenseResponse;
import com.spliteasy.entity.User;
import com.spliteasy.enums.ExpenseCategory;
import com.spliteasy.security.SecurityUtils;
import com.spliteasy.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateExpenseRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.createExpense(groupId, request, currentUser));
    }

    @GetMapping
    public ResponseEntity<Page<ExpenseResponse>> getExpenses(
            @PathVariable UUID groupId,
            @RequestParam(required = false) ExpenseCategory category,
            @RequestParam(required = false) UUID memberId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "expenseDate,desc") String sort) {
        User currentUser = SecurityUtils.getCurrentUser();
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParts[0]));
        return ResponseEntity.ok(expenseService.getExpenses(groupId, currentUser, category, memberId, dateFrom, dateTo, pageable));
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> getExpenseDetail(
            @PathVariable UUID groupId,
            @PathVariable UUID expenseId) {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(expenseService.getExpenseDetail(groupId, expenseId, currentUser));
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable UUID groupId,
            @PathVariable UUID expenseId,
            @Valid @RequestBody CreateExpenseRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(expenseService.updateExpense(groupId, expenseId, request, currentUser));
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable UUID groupId,
            @PathVariable UUID expenseId) {
        User currentUser = SecurityUtils.getCurrentUser();
        expenseService.deleteExpense(groupId, expenseId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
