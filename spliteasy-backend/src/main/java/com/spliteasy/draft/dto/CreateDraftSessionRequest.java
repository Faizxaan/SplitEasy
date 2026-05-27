package com.spliteasy.draft.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateDraftSessionRequest {

    @NotBlank
    @Size(max = 100)
    private String title;

    @Size(max = 5)
    private String currency = "INR";
}
