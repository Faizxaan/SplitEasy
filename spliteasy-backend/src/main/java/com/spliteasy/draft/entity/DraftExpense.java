package com.spliteasy.draft.entity;

import com.spliteasy.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "draft_expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DraftExpense extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "draft_session_id", nullable = false)
    private DraftSession draftSession;

    @Column(nullable = false, length = 200)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String category = "OTHER";

    @Column(nullable = false)
    private LocalDate expenseDate;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String splitType = "EQUAL";

    @Column(nullable = false)
    private UUID paidByParticipantId;

    @OneToMany(mappedBy = "draftExpense", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DraftExpenseSplit> splits = new ArrayList<>();
}
