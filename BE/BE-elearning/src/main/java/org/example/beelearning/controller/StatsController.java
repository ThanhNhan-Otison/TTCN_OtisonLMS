package org.example.beelearning.controller;



import org.example.beelearning.dto.course.CourseStatsCardResponse;
import org.example.beelearning.dto.course.CourseStudentDetailResponse;
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

    @GetMapping("/courses/{courseId}/stats/me")
    @PreAuthorize("hasRole('USER')")
    public CourseStudentStatsResponse getMyCourseStats(@PathVariable Integer courseId) {
        // request hiện tại rỗng, vẫn truyền để chuẩn kiến trúc
        return statsService.getMyCourseStats(courseId, new CourseStudentStatsRequest());
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/stats/courses/me")
    public List<CourseStatsCardResponse> myCourseStats() {
        return statsService.getStatsForMyCourses();
    }

    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/teacher/stats/courses")
    public List<CourseStatsCardResponse> teacherCourseStats() {
        return statsService.getStatsForTeacherCourses();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/stats/courses")
    public List<CourseStatsCardResponse> adminCourseStats() {
        return statsService.getStatsForAllCourses();
    }
    @PreAuthorize("hasAnyRole('USER','STUDENT')")
    @GetMapping("/stats/courses/{courseId}/student-detail")
    public CourseStudentDetailResponse myCourseDetail(@PathVariable Integer courseId) {
        return statsService.getMyCourseDetail(courseId);
    }
}
