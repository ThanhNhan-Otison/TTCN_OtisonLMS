package org.example.beelearning.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.beelearning.dto.auth.*;
import org.example.beelearning.entity.User;
import org.example.beelearning.entity.enums.Role;
import org.example.beelearning.exception.BusinessException;
import org.example.beelearning.repository.UserRepository;
import org.example.beelearning.security.CustomUserDetails;
import org.example.beelearning.security.JwtService;
import org.example.beelearning.service.EmailService;
import org.example.beelearning.service.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public Boolean addUser(RegisterRequest user) {

        Boolean checkUser = userRepository.existsByEmail(user.getEmail());
        if (checkUser) {
            throw new RuntimeException("Email Da Ton Tai");
        }
        User newUser = new User();
        newUser.setEmail(user.getEmail().trim());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        newUser.setFirstName(user.getFirstName().trim());
        if (user.getRole() != null) {
            newUser.setRole(user.getRole());
        } else {
            newUser.setRole(Role.USER);
        }

        newUser.setNgaySinh(user.getNgaySinh());
        newUser.setSoDienThoai(user.getSoDienThoai());
        newUser.setGioiTinh(user.getGioiTinh());
        newUser.setStatus(false);
        userRepository.save(newUser);
        log.info("New User {} has been saved", newUser.getEmail());
        return true;
    }

    @Override
    public List<User> getUser() {
        return userRepository.findAll();
    }
    @Override
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));
        if (!user.isStatus()) {
            throw new RuntimeException("Tài khoản đã bị ẩn hoặc chưa được kích hoạt");
        }
        Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

            CustomUserDetails cud = (CustomUserDetails) authentication.getPrincipal();
            User u = cud.getUser();
            String token = jwtService.generateToken(u.getEmail(), u.getRole().name(), u.getUserId());
            AuthResponse res = new AuthResponse();
            res.setToken(token);
            res.setEmail(u.getEmail());
            res.setFirstName(u.getFirstName());
            res.setStatus(u.isStatus());
            res.setRole(u.getRole());
            return res;
    }



    @Override
    public void forgotPassword(ForgotPasswordRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));
        String token = UUID.randomUUID().toString();
        LocalDateTime expireAt = LocalDateTime.now().plusMinutes(15);
        user.setResetToken(token);
        user.setResetTokenExpireAt(expireAt);
        userRepository.save(user);
        String resetLink = "http://localhost:5500/otisonlms/login.html?resetToken=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
        log.info("Đã gửi email reset password cho {}", user.getEmail());
    }


    @Override
    public void resetPassword(ResetPasswordRequest req) {
        User user = userRepository.findByResetToken(req.getToken())
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ"));
        if (user.getResetTokenExpireAt() == null ||
                user.getResetTokenExpireAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token đã hết hạn, vui lòng yêu cầu lại");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpireAt(null);
        userRepository.save(user);
    }
    @Override
    public User updateMe(Integer userId, UpdateMeRequest req) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng"));
        if (req.getFullName() != null) u.setFirstName(req.getFullName().trim());
        if (req.getEmail() != null) {
            String newEmail = req.getEmail().trim().toLowerCase();
            // check trùng email (nếu đổi)
            if (!newEmail.equalsIgnoreCase(u.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new BusinessException("Email đã tồn tại");
                }
                u.setEmail(newEmail);
            }
        }
        if (req.getNgaySinh() != null) u.setNgaySinh(req.getNgaySinh());
        if (req.getSoDienThoai() != null) u.setSoDienThoai(req.getSoDienThoai().trim());
        if (req.getGioiTinh() != null) u.setGioiTinh(req.getGioiTinh());
        try { u.setUpdatedDate(LocalDateTime.now()); } catch (Exception ignored) {}
        return userRepository.save(u);
    }

    @Override
    public void changePassword(Integer userId, String oldPassword, String newPassword) {
        if (oldPassword == null || oldPassword.isBlank())
            throw new BusinessException("Vui lòng nhập mật khẩu cũ");
        if (newPassword == null || newPassword.isBlank())
            throw new BusinessException("Vui lòng nhập mật khẩu mới");
        if (newPassword.length() < 6)
            throw new BusinessException("Mật khẩu mới tối thiểu 6 ký tự");
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng"));
        if (!passwordEncoder.matches(oldPassword, u.getPassword())) {
            throw new BusinessException("Mật khẩu cũ không đúng");
        }
        u.setPassword(passwordEncoder.encode(newPassword));
        try { u.setUpdatedDate(LocalDateTime.now()); } catch (Exception ignored) {}
        userRepository.save(u);
    }
}
