package org.example.beelearning.dto.auth;

import lombok.Data;
import org.example.beelearning.entity.enums.Role;

@Data
public class RegisterRequest {
    private String firstName;
    private String email;
    private String password;
    private Role role;

}
