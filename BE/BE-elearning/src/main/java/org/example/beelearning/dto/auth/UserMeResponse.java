package org.example.beelearning.dto.auth;


import org.example.beelearning.entity.enums.Role;

import java.time.LocalDate;
public record UserMeResponse(
        Integer userId,
        String email,
        String firstName,
        Role role,
        boolean status,
        LocalDate ngaySinh,
        String soDienThoai,
        Boolean gioiTinh
) {}
