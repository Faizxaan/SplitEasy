package com.spliteasy.draft.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class DraftParticipantResponse {
    private UUID id;
    private String displayName;
    private String avatarColor;
    private Boolean isCreator;
}
