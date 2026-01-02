package org.example.beelearning.controller;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.enrollment.EnrollRequest;
import org.example.beelearning.dto.enrollment.EnrollmentResponse;
import org.example.beelearning.service.EnrollmentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
@CrossOrigin
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    @PostMapping
    public EnrollmentResponse enroll(@RequestBody EnrollRequest req){

        return enrollmentService.enrollCourse(req);
    }

    // Xem các khóa 1 sinh viên đã đăng ký
    @GetMapping("/student/{studentId}")
    public List<EnrollmentResponse> getCoursesOfStudent(@PathVariable Integer studentId) {
        return enrollmentService.getCourseofStudent(studentId);
    }

    // Xem danh sách sinh viên của 1 khóa học
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @GetMapping("/course/{courseId}")
    public List<EnrollmentResponse> getStudentsOfCourse(@PathVariable Integer courseId) {
        return enrollmentService.getStudentofCourse(courseId);
    }

    @GetMapping("/me")
    public List<EnrollmentResponse> myEnrollments() {
        return enrollmentService.getMyEnrollments();
    }

}
