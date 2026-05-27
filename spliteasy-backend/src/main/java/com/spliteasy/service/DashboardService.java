package com.spliteasy.service;

import com.spliteasy.dto.response.DashboardResponse;
import com.spliteasy.entity.User;

public interface DashboardService {

    DashboardResponse getDashboard(User currentUser);
}
