package org.example.beelearning.service;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String resetLink);
    void sendGradeNotification(String toEmail,
                               String studentName,
                               String assignmentTitle,
                               Integer score,
                               String feedback);
}
