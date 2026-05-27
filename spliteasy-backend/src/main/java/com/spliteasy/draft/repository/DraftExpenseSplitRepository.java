package com.spliteasy.draft.repository;

import com.spliteasy.draft.entity.DraftExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface DraftExpenseSplitRepository extends JpaRepository<DraftExpenseSplit, UUID> {

    @Modifying
    @Query("DELETE FROM DraftExpenseSplit s WHERE s.participantId = :participantId AND s.draftExpense.draftSession.id = :sessionId")
    void deleteByParticipantIdAndSessionId(@Param("participantId") UUID participantId, @Param("sessionId") UUID sessionId);

    List<DraftExpenseSplit> findByDraftExpenseId(UUID expenseId);
}
