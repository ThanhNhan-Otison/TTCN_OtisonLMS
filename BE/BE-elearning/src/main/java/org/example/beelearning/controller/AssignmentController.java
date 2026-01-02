package org.example.beelearning.controller;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.assignment.AssignmentReqest;
import org.example.beelearning.dto.assignment.AssignmentResponse;
import org.example.beelearning.entity.Lesson;
import org.example.beelearning.service.AssignmentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
public class AssignmentController {
    private final AssignmentService assignmentService;

    // TEACHER / ADMIN tạo bài tập
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PostMapping
    public AssignmentResponse createAssignment(@RequestBody AssignmentReqest req) {
        return assignmentService.createAssignment(req);
    }

    // TEACHER / ADMIN xem tất cả bài tập (để trang assignments.html gọi GET /assignments)
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @GetMapping
    public List<AssignmentResponse> getAll() {
        return assignmentService.getAllAssignments();
    }


    // Tất cả (student đã đăng ký course) xem bài tập theo bài học
    @PreAuthorize("hasAnyRole('USER','TEACHER','ADMIN')")
    @GetMapping("/lessons/{lessonId}")
    public List<AssignmentResponse> getByLesson(@PathVariable Integer lessonId) {
        return assignmentService.getAssignmentsBylessonId(lessonId);
    }
    // USER/TEACHER/ADMIN xem chi tiết (để assignment_detail.js gọi GET /assignments/{id})
    @PreAuthorize("hasAnyRole('USER','TEACHER','ADMIN')")
    @GetMapping("/{id}")
    public AssignmentResponse getById(@PathVariable Integer id) {
        return assignmentService.getAssignmentById(id);
    }
}
