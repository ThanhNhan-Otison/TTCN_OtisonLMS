package org.example.beelearning.dto.auth;

import lombok.Data;
import org.example.beelearning.entity.enums.Role;

import java.time.LocalDate;

@Data
public class RegisterRequest {
    private String firstName;
    private String email;
    private String password;
    private Role role;

    private LocalDate ngaySinh;     // yyyy-MM-dd
    private String soDienThoai;
    private Boolean gioiTinh;

}
