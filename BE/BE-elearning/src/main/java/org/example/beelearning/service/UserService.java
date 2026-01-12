package org.example.beelearning.service;

import org.example.beelearning.dto.auth.*;
import org.example.beelearning.entity.User;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface UserService {
    Boolean addUser( RegisterRequest user);
    List<User> getUser();
    User updateMe(Integer userId, UpdateMeRequest req);
    AuthResponse login(LoginRequest user);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void changePassword(Integer userId, String oldPassword, String newPassword);
}
