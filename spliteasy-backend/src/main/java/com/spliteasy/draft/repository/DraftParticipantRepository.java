package com.spliteasy.draft.repository;

import com.spliteasy.draft.entity.DraftParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DraftParticipantRepository extends JpaRepository<DraftParticipant, UUID> {
    List<DraftParticipant> findByDraftSessionId(UUID draftSessionId);
    boolean existsByDraftSessionIdAndDisplayNameIgnoreCase(UUID draftSessionId, String displayName);
}
