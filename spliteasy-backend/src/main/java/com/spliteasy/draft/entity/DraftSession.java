package com.spliteasy.draft.entity;

import com.spliteasy.entity.BaseEntity;
import com.spliteasy.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "draft_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DraftSession extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 5)
    @Builder.Default
    private String currency = "INR";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(nullable = false, unique = true, length = 64)
    private String shareToken;

    @OneToMany(mappedBy = "draftSession", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DraftParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "draftSession", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DraftExpense> expenses = new ArrayList<>();
}
