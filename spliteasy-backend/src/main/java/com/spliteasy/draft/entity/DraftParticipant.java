package com.spliteasy.draft.entity;

import com.spliteasy.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "draft_participants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DraftParticipant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "draft_session_id", nullable = false)
    private DraftSession draftSession;

    @Column(nullable = false, length = 80)
    private String displayName;

    @Column(nullable = false, length = 7)
    private String avatarColor;

    @Column(nullable = false)
    @Builder.Default
    private boolean isCreator = false;
}
