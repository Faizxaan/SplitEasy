package com.spliteasy.repository;

import com.spliteasy.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, UUID> {

    List<ExpenseSplit> findByExpenseId(UUID expenseId);

    List<ExpenseSplit> findByUserId(UUID userId);

    @Query("SELECT s FROM ExpenseSplit s WHERE s.expense.group.id = :groupId AND s.user.id = :userId")
    List<ExpenseSplit> findByGroupIdAndUserId(@Param("groupId") UUID groupId, @Param("userId") UUID userId);

    @Query("SELECT SUM(s.amount) FROM ExpenseSplit s WHERE s.expense.group.id = :groupId AND s.user.id = :userId")
    BigDecimal sumOwedAmountByGroupIdAndUserId(@Param("groupId") UUID groupId, @Param("userId") UUID userId);

    void deleteByExpenseId(UUID expenseId);
}
