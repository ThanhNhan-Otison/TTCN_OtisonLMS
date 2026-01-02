package org.example.beelearning.service;

import org.example.beelearning.dto.auth.*;
import org.example.beelearning.entity.User;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface UserService {
    public Boolean addUser( RegisterRequest user);

    List<User> getUser();

    AuthResponse login(LoginRequest user);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
//    AuthResponse login(User user, String rawPassword) ;

}
