package com.spliteasy.dto.request;

import com.spliteasy.enums.GroupCategory;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateGroupRequest {

    @Size(max = 50, message = "Group name must not exceed 50 characters")
    private String name;

    @Size(max = 200, message = "Description must not exceed 200 characters")
    private String description;

    private GroupCategory category;
}
