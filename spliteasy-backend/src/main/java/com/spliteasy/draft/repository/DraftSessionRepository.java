package com.spliteasy.draft.repository;

import com.spliteasy.draft.entity.DraftSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DraftSessionRepository extends JpaRepository<DraftSession, UUID> {
    List<DraftSession> findByCreatedByIdOrderByCreatedAtDesc(UUID createdById);
    Optional<DraftSession> findByShareToken(String shareToken);
}
