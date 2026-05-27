package com.spliteasy.repository;

import com.spliteasy.entity.Expense;
import com.spliteasy.enums.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findByGroupIdOrderByExpenseDateDesc(UUID groupId);

    org.springframework.data.domain.Page<Expense> findByGroupId(UUID groupId, org.springframework.data.domain.Pageable pageable);

    List<Expense> findByGroupIdAndPaidByIdOrderByExpenseDateDesc(UUID groupId, UUID paidById);

    org.springframework.data.domain.Page<Expense> findByGroupIdAndPaidById(UUID groupId, UUID paidById, org.springframework.data.domain.Pageable pageable);

    List<Expense> findByGroupIdAndCategoryOrderByExpenseDateDesc(UUID groupId, ExpenseCategory category);

    org.springframework.data.domain.Page<Expense> findByGroupIdAndCategory(UUID groupId, ExpenseCategory category, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT e FROM Expense e WHERE e.group.id = :groupId AND e.expenseDate BETWEEN :from AND :to ORDER BY e.expenseDate DESC")
    List<Expense> findByGroupIdAndDateRange(
            @Param("groupId") UUID groupId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("SELECT e FROM Expense e WHERE e.group.id = :groupId AND e.expenseDate BETWEEN :from AND :to")
    org.springframework.data.domain.Page<Expense> findByGroupIdAndDateRange(
            @Param("groupId") UUID groupId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            org.springframework.data.domain.Pageable pageable
    );

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.group.id = :groupId")
    java.math.BigDecimal sumAmountByGroupId(@Param("groupId") UUID groupId);

    @Query("SELECT e FROM Expense e WHERE e.group.id = :groupId ORDER BY e.amount DESC")
    List<Expense> findByGroupIdOrderByAmountDesc(@Param("groupId") UUID groupId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.group.id = :groupId AND e.paidBy.id = :userId")
    java.math.BigDecimal sumPaidByUserInGroup(@Param("groupId") UUID groupId, @Param("userId") UUID userId);

    @Query("SELECT e FROM Expense e WHERE e.group.id IN :groupIds ORDER BY e.expenseDate DESC, e.createdAt DESC")
    List<Expense> findRecentByGroupIds(@Param("groupIds") List<UUID> groupIds, org.springframework.data.domain.Pageable pageable);
}
