package org.example.beelearning.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStrorageService {

    private final String videoPath = "C:/Document/TTCN/BE/BE-elearning/uploads/videos/";
    private final String submissionPath = "C:/Document/TTCN/BE/BE-elearning/uploads/submissions/";

    public String saveVideo(MultipartFile file) throws IOException {
        String original = file.getOriginalFilename().toLowerCase();
        if (!(original.endsWith(".mp4") || original.endsWith(".mov") || original.endsWith(".avi"))) {
            throw new RuntimeException("Chỉ hỗ trợ file video: mp4, mov, avi");
        }

        File folder = new File(videoPath);
        if (!folder.exists()) folder.mkdirs();

        String fileName = UUID.randomUUID() + "_" + original;
        Path filePath = Paths.get(videoPath + fileName);
        Files.write(filePath, file.getBytes());

        return "/videos/" + fileName;
    }

    // ✅ THÊM HÀM NÀY
    public String saveSubmissionFile(MultipartFile file) throws IOException {
        String original = file.getOriginalFilename();
        if (original == null || original.isBlank()) {
            throw new RuntimeException("File không hợp lệ");
        }
        String lower = original.toLowerCase();

        // Cho phép các định dạng bài nộp phổ biến (bạn có thể chỉnh)
        if (!(lower.endsWith(".pdf") || lower.endsWith(".doc") || lower.endsWith(".docx")
                || lower.endsWith(".zip") || lower.endsWith(".rar")
                || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg"))) {
            throw new RuntimeException("File nộp chỉ hỗ trợ: pdf, doc, docx, zip, rar, png, jpg, jpeg");
        }

        File folder = new File(submissionPath);
        if (!folder.exists()) folder.mkdirs();

        String fileName = UUID.randomUUID() + "_" + original.replaceAll("\\s+", "_");
        Path filePath = Paths.get(submissionPath + fileName);
        Files.write(filePath, file.getBytes());

        // URL để FE truy cập (tí nữa phải map static giống /videos)
        return "/submissions/" + fileName;
    }
}
