package com.spliteasy.dto.response;

import com.spliteasy.enums.Currency;
import com.spliteasy.enums.GroupCategory;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class GroupDetailResponse {

    private UUID id;
    private String name;
    private String description;
    private GroupCategory category;
    private Currency currency;
    private String inviteCode;
    private UserResponse createdBy;
    private List<MemberResponse> members;
    private BigDecimal totalExpenses;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
