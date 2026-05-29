package com.spliteasy.draft.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddDraftParticipantRequest {

    @NotBlank
    @Size(max = 50, message = "Name must not exceed 50 characters")
    @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9\\s\\-_&']+$", message = "Name contains invalid characters")
    private String displayName;
}
