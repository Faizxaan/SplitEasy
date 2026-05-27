package com.spliteasy.dto.response;

import com.spliteasy.enums.Currency;
import com.spliteasy.enums.GroupCategory;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class GroupResponse {

    private UUID id;
    private String name;
    private String description;
    private GroupCategory category;
    private Currency currency;
    private String inviteCode;
    private UserResponse createdBy;
    private List<GroupMemberResponse> members;
    private int memberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
