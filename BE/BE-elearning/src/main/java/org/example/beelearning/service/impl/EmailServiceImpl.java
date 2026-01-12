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
    @Override
    public void sendGradeNotification(String toEmail,
                                      String studentName,
                                      String assignmentTitle,
                                      Integer score,
                                      String feedback) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Thông báo chấm điểm: " + assignmentTitle);

        String fb = (feedback == null || feedback.isBlank()) ? "(Không có nhận xét)" : feedback;

        message.setText(
                "Chào " + (studentName == null ? "" : studentName) + ",\n\n" +
                        "Bài tập: " + assignmentTitle + "\n" +
                        "Điểm: " + score + "\n" +
                        "Nhận xét: " + fb + "\n\n" +
                        "BeeLearning"
        );

        mailSender.send(message);
    }
}
