package com.spliteasy.draft.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddDraftParticipantRequest {

    @NotBlank
    @Size(max = 30, message = "Name must not exceed 30 characters")
    @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9\\s\\-_&']+$", message = "Name contains invalid characters")
    private String displayName;
}
