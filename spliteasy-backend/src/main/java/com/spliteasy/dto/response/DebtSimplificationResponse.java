package com.spliteasy.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class DebtSimplificationResponse {

    private UUID fromUserId;
    private String fromUserName;
    private String fromUserAvatarColor;
    private UUID toUserId;
    private String toUserName;
    private String toUserAvatarColor;
    private BigDecimal amount;
}
