package org.example.beelearning.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.service.EmailService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Yêu cầu đặt lại mật khẩu");
        message.setText(
                "Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n" +
                        "Nhấn vào link dưới đây để đặt lại mật khẩu:\n" +
                        resetLink + "\n\n" +
                        "Nếu không phải bạn yêu cầu, hãy bỏ qua email này."
        );
        mailSender.send(message);
    }
}
