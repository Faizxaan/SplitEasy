package com.spliteasy.controller;

import com.spliteasy.dto.request.CreateGroupRequest;
import com.spliteasy.dto.request.UpdateGroupRequest;
import com.spliteasy.dto.response.GroupDetailResponse;
import com.spliteasy.dto.response.GroupPreviewResponse;
import com.spliteasy.dto.response.GroupSummaryResponse;
import com.spliteasy.dto.response.MemberResponse;
import com.spliteasy.entity.User;
import com.spliteasy.security.SecurityUtils;
import com.spliteasy.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<GroupDetailResponse> createGroup(@Valid @RequestBody CreateGroupRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.createGroup(request, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<GroupSummaryResponse>> getUserGroups() {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(groupService.getUserGroups(currentUser));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupDetailResponse> getGroupDetail(@PathVariable UUID groupId) {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(groupService.getGroupDetail(groupId, currentUser));
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<GroupDetailResponse> updateGroup(
            @PathVariable UUID groupId,
            @Valid @RequestBody UpdateGroupRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(groupService.updateGroup(groupId, request, currentUser));
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable UUID groupId) {
        User currentUser = SecurityUtils.getCurrentUser();
        groupService.deleteGroup(groupId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/join/{inviteCode}")
    public ResponseEntity<GroupPreviewResponse> getGroupPreview(@PathVariable String inviteCode) {
        return ResponseEntity.ok(groupService.getGroupPreview(inviteCode));
    }

    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<GroupDetailResponse> joinGroup(@PathVariable String inviteCode) {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(groupService.joinGroup(inviteCode, currentUser));
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<Void> leaveGroup(@PathVariable UUID groupId) {
        User currentUser = SecurityUtils.getCurrentUser();
        groupService.leaveGroup(groupId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<MemberResponse>> getGroupMembers(@PathVariable UUID groupId) {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(groupService.getGroupMembers(groupId, currentUser));
    }
}
