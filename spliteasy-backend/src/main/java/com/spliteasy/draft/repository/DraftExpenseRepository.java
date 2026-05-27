package com.spliteasy.draft.repository;

import com.spliteasy.draft.entity.DraftExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DraftExpenseRepository extends JpaRepository<DraftExpense, UUID> {
    List<DraftExpense> findByDraftSessionIdOrderByExpenseDateDesc(UUID draftSessionId);
}
