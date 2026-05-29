package com.spliteasy.dto.request;

import com.spliteasy.enums.GroupCategory;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateGroupRequest {

    @Size(max = 30, message = "Group name must not exceed 30 characters")
    @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9\\s\\-_&']+$", message = "Group name contains invalid characters")
    private String name;

    @Size(max = 200, message = "Description must not exceed 200 characters")
    private String description;

    private GroupCategory category;
}
