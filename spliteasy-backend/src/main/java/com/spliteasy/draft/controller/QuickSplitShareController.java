package com.spliteasy.draft.controller;

import com.spliteasy.draft.dto.DraftSessionResponse;
import com.spliteasy.draft.service.DraftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quick-splits/share")
@RequiredArgsConstructor
public class QuickSplitShareController {

    private final DraftService draftService;

    @GetMapping("/{shareToken}")
    public ResponseEntity<DraftSessionResponse> getSharedDraft(@PathVariable String shareToken) {
        return ResponseEntity.ok(draftService.getByShareToken(shareToken));
    }
}
