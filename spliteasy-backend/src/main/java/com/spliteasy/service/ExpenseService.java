package com.spliteasy.service;

import com.spliteasy.dto.request.CreateExpenseRequest;
import com.spliteasy.dto.response.ExpenseResponse;
import com.spliteasy.entity.User;
import com.spliteasy.enums.ExpenseCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface ExpenseService {

    ExpenseResponse createExpense(UUID groupId, CreateExpenseRequest request, User currentUser);

    Page<ExpenseResponse> getExpenses(UUID groupId, User currentUser,
                                      ExpenseCategory category, UUID memberId,
                                      LocalDate dateFrom, LocalDate dateTo, Pageable pageable);

    ExpenseResponse getExpenseDetail(UUID groupId, UUID expenseId, User currentUser);

    ExpenseResponse updateExpense(UUID groupId, UUID expenseId, CreateExpenseRequest request, User currentUser);

    void deleteExpense(UUID groupId, UUID expenseId, User currentUser);
}
