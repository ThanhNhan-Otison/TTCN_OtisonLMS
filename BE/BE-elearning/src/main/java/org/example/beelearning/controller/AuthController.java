package org.example.beelearning.controller;

import lombok.RequiredArgsConstructor;

import org.example.beelearning.dto.auth.*;
import org.example.beelearning.entity.User;
import org.example.beelearning.repository.UserRepository;
import org.example.beelearning.security.CustomUserDetails;
import org.example.beelearning.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final UserService userService;


    @PostMapping("/register")
    public Boolean addUser(@RequestBody RegisterRequest user){
        return userService.addUser(user);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest user){
        return userService.login(user);

    }
    @GetMapping("/user")
    public List<User> getUser(){
        return  userService.getUser();
    }
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody ForgotPasswordRequest req) {
        userService.forgotPassword(req);
        return "Đã gửi token đặt lại mật khẩu (kiểm tra console)";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody ResetPasswordRequest req) {
        userService.resetPassword(req);
        return "Đổi mật khẩu thành công!";
    }
    @GetMapping("/me")
    public UserMeResponse me(Authentication authentication) {
        CustomUserDetails cud = (CustomUserDetails) authentication.getPrincipal();
        User u = cud.getUser();
        return new UserMeResponse(
                u.getUserId(),
                u.getEmail(),
                u.getFirstName(),
                u.getRole(),
                u.isStatus(),
                u.getNgaySinh(),      // ✅ đúng vị trí LocalDate
                u.getSoDienThoai(),   // ✅ đúng
                u.getGioiTinh()
        );
    }
    // ✅ UPDATE PROFILE (sửa fullName + email + info)
    @PutMapping("/me")
    public UserMeResponse updateMe(@RequestBody UpdateMeRequest req,
                                   Authentication authentication) {
        CustomUserDetails cud = (CustomUserDetails) authentication.getPrincipal();
        User current = cud.getUser();

        User saved = userService.updateMe(current.getUserId(), req);

        return new UserMeResponse(
                saved.getUserId(),
                saved.getEmail(),
                saved.getFirstName(),
                saved.getRole(),
                saved.isStatus(),
                saved.getNgaySinh(),
                saved.getSoDienThoai(),
                saved.getGioiTinh()
        );
    }

    // ✅ CHANGE PASSWORD
    @PutMapping("/change-password")
    public String changePassword(@RequestBody ChangePasswordRequest req,
                                 Authentication authentication) {
        CustomUserDetails cud = (CustomUserDetails) authentication.getPrincipal();
        User current = cud.getUser();

        userService.changePassword(current.getUserId(), req.getOldPassword(), req.getNewPassword());
        return "Đổi mật khẩu thành công!";
    }
}
