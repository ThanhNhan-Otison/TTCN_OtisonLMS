package org.example.beelearning.service;

import org.example.beelearning.dto.assignment.AssignmentResponse;
import org.example.beelearning.dto.course.CourseRequest;
import org.example.beelearning.dto.course.CourseResponse;
import org.example.beelearning.dto.submission.SubmissionTeacherResponse;
import org.example.beelearning.entity.enums.CourseStatus;

import java.util.List;

public interface CourseService {
    CourseResponse createCourse(CourseRequest req);
    List<CourseResponse> getAllCourses();
    List<CourseResponse> getCoursesByTeacher(Integer teacherId);
    CourseResponse getCourse(Integer courseId);
    List<CourseResponse> getPublishedCourses();
    CourseResponse updateCourse(Integer courseId, CourseRequest req);
    void deleteCourse(Integer courseId);
    void updateStatus(Integer courseId, CourseStatus status);
    List<CourseResponse> getEnrolledCourses(Integer userId);
    List<AssignmentResponse> getAssignmentsByCourse(Integer courseId);
    List<SubmissionTeacherResponse> getSubmissionsByCourse(Integer courseId);
}
