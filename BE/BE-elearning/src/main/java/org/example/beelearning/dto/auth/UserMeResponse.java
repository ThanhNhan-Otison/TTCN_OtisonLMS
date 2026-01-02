package org.example.beelearning.dto.auth;


import org.example.beelearning.entity.enums.Role;

import java.time.LocalDateTime;


public record UserMeResponse(
        Integer userId,
        String email,
        String firstName,
        Role role,
        boolean status

) {}
