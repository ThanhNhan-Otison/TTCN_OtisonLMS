package org.example.beelearning.controller;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.entity.Course;
import org.example.beelearning.entity.User;
import org.example.beelearning.entity.enums.Role;
import org.example.beelearning.exception.BusinessException;
import org.example.beelearning.repository.CourseRepository;
import org.example.beelearning.security.CustomUserDetails;
import org.example.beelearning.service.impl.FileStrorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;



@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
public class UploadController {
    private final FileStrorageService fileStrorageService;
    private final CourseRepository courseRepository;

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PostMapping("/video")
    public ResponseEntity<String> uploadVideo(@RequestParam("file") MultipartFile file,@RequestParam("courseId") Integer courseId) {
        // lấy user đang login
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = (CustomUserDetails) auth.getPrincipal();
        User user = principal.getUser();

        // lấy course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course không tồn tại"));

        // 🔥 CHECK QUYỀN
        if (user.getRole() == Role.TEACHER &&
                !course.getTeacher().getUserId().equals(user.getUserId())) {
            throw new BusinessException("Không có quyền upload bài học cho khóa học này");
        }

        try {
            String url= fileStrorageService.saveVideo(file);
            return ResponseEntity.ok(url);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("upload that bai: "+ e.getMessage());
        }
    }

    @PostMapping("/document")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public String uploadDocument(@RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            throw new RuntimeException("File rỗng");
        }

        String originalName = file.getOriginalFilename();
        String ext = "";

        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        }


        // Validate loại file
        List<String> allowed = List.of("pdf", "doc", "docx", "ppt", "pptx");
        if (!allowed.contains(ext)) {
            throw new RuntimeException("Chỉ cho phép pdf, doc, docx, ppt, pptx");
        }


        // 📁 thư mục lưu
        String uploadDir = "uploads/docs";
        Files.createDirectories(Paths.get(uploadDir));

        // 🔥 TẠO TÊN FILE MỚI (CHỖ BẠN THIẾU)
        String savedFileName = UUID.randomUUID() + "." + ext;

        // đường dẫn lưu
        Path savePath = Paths.get(uploadDir, savedFileName);

        // lưu file
        Files.copy(file.getInputStream(), savePath, StandardCopyOption.REPLACE_EXISTING);

        // trả về cho FE
        return "/docs/" + savedFileName;
    }


}
