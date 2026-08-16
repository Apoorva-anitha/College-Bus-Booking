package com.collegebus.dto;

import java.util.List;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    long expiresInMs,
    String userId,
    String username,
    String fullName,
    String email,
    List<String> roles,
    String studentId,
    String driverId
) {}
