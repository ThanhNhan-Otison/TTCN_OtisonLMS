package org.example.beelearning.controller;


import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.course.TeacherCourseStatsResponse;
import org.example.beelearning.entity.Course;
import org.example.beelearning.repository.CourseRepository;
import org.example.beelearning.security.SecurityUtil;
import org.example.beelearning.entity.User;
import org.example.beelearning.service.StatsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
public class TeacherCourseController {

    private final CourseRepository courseRepository;
    private final StatsService statsService;

    // TEACHER chỉ xem các course mình dạy
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    @GetMapping("/courses")
    public List<Course> myCourses() {
        User me = SecurityUtil.getCurrentUser();
        return courseRepository.findAllByTeacherId(me.getUserId());
    }
    // ✅ THÊM API NÀY để FE gọi /teacher/courses/{id}/stats
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    @GetMapping("/courses/{courseId}/stats")
    public TeacherCourseStatsResponse getCourseStats(@PathVariable Integer courseId) {
        User me = SecurityUtil.getCurrentUser();
        return statsService.getTeacherCourseStats(courseId, me);
    }
}