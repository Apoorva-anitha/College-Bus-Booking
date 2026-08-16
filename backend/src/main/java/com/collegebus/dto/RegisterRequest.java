package com.collegebus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(min = 3, max = 50)
    String username,

    @NotBlank @Email
    String email,

    @NotBlank @Size(min = 6, max = 100)
    String password,

    @NotBlank
    String fullName,

    String phone,

    // Student-specific fields (if role is STUDENT)
    String registerNumber,
    String department,
    String academicYear,
    String defaultAreaId,

    // Role requested (defaults to ROLE_STUDENT if blank)
    String requestedRole
) {}
