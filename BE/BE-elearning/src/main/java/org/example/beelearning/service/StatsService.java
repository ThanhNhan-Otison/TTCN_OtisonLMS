package org.example.beelearning.service;

import org.example.beelearning.dto.course.CourseStudentStatsRequest;
import org.example.beelearning.dto.course.CourseStudentStatsResponse;
import org.example.beelearning.dto.course.TeacherCourseStatsResponse;
import org.example.beelearning.entity.User;

public interface StatsService {

    // Thống kê cho USER của chính họ trong 1 course
    CourseStudentStatsResponse getMyCourseStats(Integer courseId, CourseStudentStatsRequest request);
    // ✅ thêm
    TeacherCourseStatsResponse getTeacherCourseStats(Integer courseId, User requester);

}
