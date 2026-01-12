package org.example.beelearning.service;

import org.example.beelearning.dto.course.*;
import org.example.beelearning.entity.User;

import java.util.List;

public interface StatsService {
    CourseStudentStatsResponse getMyCourseStats(Integer courseId, CourseStudentStatsRequest request);
    TeacherCourseStatsResponse getTeacherCourseStats(Integer courseId, User requester);
    List<CourseStatsCardResponse> getStatsForMyCourses();
    List<CourseStatsCardResponse> getStatsForTeacherCourses();
    List<CourseStatsCardResponse> getStatsForAllCourses();
    CourseStudentDetailResponse getMyCourseDetail(Integer courseId);
}
