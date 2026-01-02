package org.example.beelearning.dto.auth;

import lombok.Data;
import org.example.beelearning.entity.enums.Role;
//@Data
//public class AuthResponse {
//
//    private  String email;
//    private  String firstName;
//    private boolean status;
//    private Role role;
//
//}
@Data
public class AuthResponse {
    private String token;
    private String email;
    private String firstName;
    private boolean status;
    private Role role;
}

