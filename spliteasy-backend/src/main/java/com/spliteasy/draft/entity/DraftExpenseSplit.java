package com.spliteasy.draft.entity;

import com.spliteasy.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "draft_expense_splits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DraftExpenseSplit extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "draft_expense_id", nullable = false)
    private DraftExpense draftExpense;

    @Column(nullable = false)
    private UUID participantId;

    @Column(precision = 12, scale = 2)
    private BigDecimal shareValue;
}
