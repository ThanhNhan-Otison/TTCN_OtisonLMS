package org.example.beelearning.service;

import org.example.beelearning.dto.enrollment.EnrollRequest;
import org.example.beelearning.dto.enrollment.EnrollmentResponse;

import java.util.List;

public interface EnrollmentService {
    EnrollmentResponse enrollCourse(EnrollRequest req);
    List<EnrollmentResponse> getCourseofStudent(Integer userID);
    List<EnrollmentResponse> getStudentofCourse(Integer courseId);
    List<EnrollmentResponse> myEnrollments();
    List<EnrollmentResponse> getByCourse(Integer courseId);
    List<EnrollmentResponse> getMyEnrollments();
}
