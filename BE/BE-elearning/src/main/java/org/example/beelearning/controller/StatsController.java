package org.example.beelearning.controller;



import org.example.beelearning.dto.course.CourseStudentStatsRequest;
import org.example.beelearning.dto.course.CourseStudentStatsResponse;
import org.example.beelearning.service.StatsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
}
