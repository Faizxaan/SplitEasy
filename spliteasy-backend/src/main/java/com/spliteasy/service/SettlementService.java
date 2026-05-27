package com.spliteasy.service;

import com.spliteasy.dto.request.CreateSettlementRequest;
import com.spliteasy.dto.response.SettlementResponse;
import com.spliteasy.entity.User;

import java.util.List;
import java.util.UUID;

public interface SettlementService {

    SettlementResponse createSettlement(UUID groupId, CreateSettlementRequest request, User currentUser);

    List<SettlementResponse> getGroupSettlements(UUID groupId, User currentUser);

    void deleteSettlement(UUID groupId, UUID settlementId, User currentUser);
}
