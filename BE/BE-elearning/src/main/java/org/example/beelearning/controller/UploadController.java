package org.example.beelearning.controller;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.service.impl.FileStrorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
public class UploadController {
    private final FileStrorageService fileStrorageService;

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PostMapping("/video")
    public ResponseEntity<String> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            String url= fileStrorageService.saveVideo(file);
            return ResponseEntity.ok(url);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("upload that bai: "+ e.getMessage());
        }
    }
}
