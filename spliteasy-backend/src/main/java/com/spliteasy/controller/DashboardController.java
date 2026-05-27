package com.spliteasy.controller;

import com.spliteasy.dto.response.DashboardResponse;
import com.spliteasy.entity.User;
import com.spliteasy.security.SecurityUtils;
import com.spliteasy.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard() {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(dashboardService.getDashboard(currentUser));
    }
}
