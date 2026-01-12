package org.example.beelearning.service;

import org.example.beelearning.dto.course.CourseStatsCardResponse;
import org.example.beelearning.dto.course.CourseStudentStatsRequest;
import org.example.beelearning.dto.course.CourseStudentStatsResponse;
import org.example.beelearning.dto.course.TeacherCourseStatsResponse;
import org.example.beelearning.entity.User;

import java.util.List;

public interface StatsService {

    // Thống kê cho USER của chính họ trong 1 course
    CourseStudentStatsResponse getMyCourseStats(Integer courseId, CourseStudentStatsRequest request);
    // ✅ thêm
    TeacherCourseStatsResponse getTeacherCourseStats(Integer courseId, User requester);

    // USER – tất cả khóa đã đăng ký
    List<CourseStatsCardResponse> getStatsForMyCourses();

    // TEACHER – các khóa mình dạy
    List<CourseStatsCardResponse> getStatsForTeacherCourses();

    // ADMIN – toàn bộ khóa học
    List<CourseStatsCardResponse> getStatsForAllCourses();
}
