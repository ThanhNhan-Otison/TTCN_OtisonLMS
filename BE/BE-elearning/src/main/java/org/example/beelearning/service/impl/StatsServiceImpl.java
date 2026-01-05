package org.example.beelearning.service.impl;

import org.example.beelearning.dto.course.CourseStudentStatsRequest;
import org.example.beelearning.dto.course.CourseStudentStatsResponse;
import org.example.beelearning.dto.course.TeacherCourseStatsResponse;
import org.example.beelearning.entity.Course;
import org.example.beelearning.entity.User;
import org.example.beelearning.exception.BusinessException;
import org.example.beelearning.repository.AssignmentRepository;
import org.example.beelearning.repository.CourseRepository;
import org.example.beelearning.repository.EnrollmentRepository;
import org.example.beelearning.repository.SubmissionRepository;
import org.example.beelearning.security.SecurityUtil;
import org.example.beelearning.service.StatsService;
import org.springframework.stereotype.Service;

@Service
public class StatsServiceImpl implements StatsService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    public StatsServiceImpl(CourseRepository courseRepository,
                            EnrollmentRepository enrollmentRepository,
                            AssignmentRepository assignmentRepository,
                            SubmissionRepository submissionRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
    }

    // ===================== USER / STUDENT =====================
    @Override
    public CourseStudentStatsResponse getMyCourseStats(Integer courseId, CourseStudentStatsRequest request) {

        Integer userId = SecurityUtil.getCurrentUser().getUserId();

        // check đã đăng ký chưa
        boolean enrolled = enrollmentRepository.existsByStudent_UserIdAndCourse_CourseId(userId, courseId);
        if (!enrolled) {
            throw new BusinessException("Bạn chưa đăng ký khóa học này");
        }

        long totalAssignments = assignmentRepository.countAssignmentsInCourse(courseId);
        long submittedAssignments = submissionRepository.countDistinctAssignmentsSubmittedInCourse(courseId, userId);
        long pendingAssignments = Math.max(0, totalAssignments - submittedAssignments);

        String courseStatus = (totalAssignments > 0 && submittedAssignments >= totalAssignments)
                ? "COMPLETED"
                : "ONGOING";

        return new CourseStudentStatsResponse(
                totalAssignments,
                submittedAssignments,
                pendingAssignments,
                courseStatus
        );
    }

    // ===================== TEACHER / ADMIN =====================
    @Override
    public TeacherCourseStatsResponse getTeacherCourseStats(Integer courseId, User requester) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy khóa học"));

        // ✅ check quyền: TEACHER chỉ được xem course của mình, ADMIN bỏ qua
        String role = String.valueOf(requester.getRole()).toUpperCase();
        boolean isAdmin = role.contains("ADMIN");
        boolean isTeacher = role.contains("TEACHER");

        if (isTeacher && !isAdmin) {
            // ⚠️ đoạn này phụ thuộc Course entity của bạn
            // Nếu Course có field teacher kiểu User -> course.getTeacher().getUserId()
            Integer ownerTeacherId = (course.getTeacher() != null) ? course.getTeacher().getUserId() : null;

            if (ownerTeacherId == null || !ownerTeacherId.equals(requester.getUserId())) {
                throw new BusinessException("Bạn không quản lý khóa học này");
            }
        }

        long totalStudents = enrollmentRepository.countStudentsInCourse(courseId);
        long totalAssignments = assignmentRepository.countAssignmentsInCourse(courseId);
        long totalSubmissions = submissionRepository.countSubmissionsInCourse(courseId);
        long submittedStudents = submissionRepository.countDistinctStudentsSubmittedInCourse(courseId);

        Double avgScore = submissionRepository.avgScoreInCourse(courseId); // có thể null
        Double rate = null;
        if (totalStudents > 0) {
            rate = (submittedStudents * 100.0) / totalStudents;
        }

        return new TeacherCourseStatsResponse(
                totalStudents,
                submittedStudents,
                totalAssignments,
                totalSubmissions,
                avgScore,
                rate
        );
    }
}
