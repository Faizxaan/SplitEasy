package com.spliteasy.service;

import com.spliteasy.dto.request.CreateGroupRequest;
import com.spliteasy.dto.request.UpdateGroupRequest;
import com.spliteasy.dto.response.GroupDetailResponse;
import com.spliteasy.dto.response.GroupPreviewResponse;
import com.spliteasy.dto.response.GroupSummaryResponse;
import com.spliteasy.dto.response.MemberResponse;
import com.spliteasy.entity.User;

import java.util.List;
import java.util.UUID;

public interface GroupService {

    GroupDetailResponse createGroup(CreateGroupRequest request, User currentUser);

    List<GroupSummaryResponse> getUserGroups(User currentUser);

    GroupDetailResponse getGroupDetail(UUID groupId, User currentUser);

    GroupDetailResponse updateGroup(UUID groupId, UpdateGroupRequest request, User currentUser);

    void deleteGroup(UUID groupId, User currentUser);

    GroupPreviewResponse getGroupPreview(String inviteCode);

    GroupDetailResponse joinGroup(String inviteCode, User currentUser);

    void leaveGroup(UUID groupId, User currentUser);

    List<MemberResponse> getGroupMembers(UUID groupId, User currentUser);
}
