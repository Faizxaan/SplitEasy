package com.spliteasy.draft.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateDraftSessionRequest {

    @NotBlank
    @Size(max = 50, message = "Title must not exceed 50 characters")
    @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9\\s\\-_&']+$", message = "Title contains invalid characters")
    private String title;

    @Size(max = 5)
    private String currency = "INR";
}
