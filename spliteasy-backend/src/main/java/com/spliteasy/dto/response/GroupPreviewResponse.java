package com.spliteasy.dto.response;

import com.spliteasy.enums.Currency;
import com.spliteasy.enums.GroupCategory;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GroupPreviewResponse {

    private String name;
    private String description;
    private GroupCategory category;
    private Currency currency;
    private int memberCount;
}
