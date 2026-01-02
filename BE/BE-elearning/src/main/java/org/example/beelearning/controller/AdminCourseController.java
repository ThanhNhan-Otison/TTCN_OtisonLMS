package org.example.beelearning.controller;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.course.CourseStatusRequest;
import org.example.beelearning.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {

    private final CourseService courseService;

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateCourseStatus(
            @PathVariable Integer id,
            @RequestBody CourseStatusRequest req
    ) {
        courseService.updateStatus(id, req.getStatus());
        return ResponseEntity.ok().build();
    }
}