package com.spliteasy.draft.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddDraftParticipantRequest {

    @NotBlank
    @Size(max = 80)
    private String displayName;
}
