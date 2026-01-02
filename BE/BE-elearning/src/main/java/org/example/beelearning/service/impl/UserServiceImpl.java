package org.example.beelearning.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.beelearning.dto.auth.*;
import org.example.beelearning.entity.User;
import org.example.beelearning.entity.enums.Role;
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

        if (checkUser == true) {
                throw new RuntimeException("Email Da Ton Tai");
            }
        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        newUser.setFirstName(user.getFirstName());

        if (user.getRole() != null) {
            newUser.setRole(user.getRole());
        } else {
            newUser.setRole(Role.USER); //mặc định là USER
        }
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

        // Link FE reset mật khẩu – bạn chỉnh lại theo app của bạn
        String resetLink = "http://localhost:5500/reset-password.html?token=" + token;

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
}
