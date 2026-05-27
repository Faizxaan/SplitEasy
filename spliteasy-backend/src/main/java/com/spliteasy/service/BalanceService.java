package com.spliteasy.service;

import com.spliteasy.dto.response.MemberBalanceResponse;
import com.spliteasy.dto.response.SimplifiedDebtResponse;
import com.spliteasy.entity.User;

import java.util.List;
import java.util.UUID;

public interface BalanceService {

    List<MemberBalanceResponse> getGroupBalances(UUID groupId, User currentUser);

    List<SimplifiedDebtResponse> getSimplifiedDebts(UUID groupId, User currentUser);
}
