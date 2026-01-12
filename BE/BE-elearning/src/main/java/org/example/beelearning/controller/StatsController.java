package org.example.beelearning.controller;



import org.example.beelearning.dto.course.CourseStatsCardResponse;
import org.example.beelearning.dto.course.CourseStudentStatsRequest;
import org.example.beelearning.dto.course.CourseStudentStatsResponse;
import org.example.beelearning.service.StatsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    // USER: GET /api/v1/courses/{courseId}/stats/me
    @GetMapping("/courses/{courseId}/stats/me")
    @PreAuthorize("hasRole('USER')")
    public CourseStudentStatsResponse getMyCourseStats(@PathVariable Integer courseId) {
        // request hiện tại rỗng, vẫn truyền để chuẩn kiến trúc
        return statsService.getMyCourseStats(courseId, new CourseStudentStatsRequest());
    }

    // ================= USER =================

    // USER – xem thống kê TẤT CẢ khóa đã đăng ký
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/stats/courses/me")
    public List<CourseStatsCardResponse> myCourseStats() {
        return statsService.getStatsForMyCourses();
    }

    // USER – xem thống kê 1 khóa (bạn đã có)
//    @PreAuthorize("hasRole('USER')")
//    @GetMapping("/courses/{courseId}/stats/me")
//    public CourseStudentStatsResponse getMyCourseStats(
//            @PathVariable Integer courseId) {
//        return statsService.getMyCourseStats(courseId, new CourseStudentStatsRequest());
//    }

    // ================= TEACHER =================

    // TEACHER – xem thống kê các khóa mình dạy
    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/teacher/stats/courses")
    public List<CourseStatsCardResponse> teacherCourseStats() {
        return statsService.getStatsForTeacherCourses();
    }

    // ================= ADMIN =================

    // ADMIN – xem thống kê toàn bộ khóa học
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/stats/courses")
    public List<CourseStatsCardResponse> adminCourseStats() {
        return statsService.getStatsForAllCourses();
    }
}
