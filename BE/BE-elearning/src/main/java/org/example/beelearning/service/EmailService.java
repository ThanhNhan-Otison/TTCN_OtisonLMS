package org.example.beelearning.service;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String resetLink);
}
