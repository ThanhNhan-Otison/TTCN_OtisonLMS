package org.example.beelearning.service.impl;

import org.example.beelearning.dto.course.*;
import org.example.beelearning.entity.*;
import org.example.beelearning.exception.BusinessException;
import org.example.beelearning.repository.AssignmentRepository;
import org.example.beelearning.repository.CourseRepository;
import org.example.beelearning.repository.EnrollmentRepository;
import org.example.beelearning.repository.SubmissionRepository;
import org.example.beelearning.security.SecurityUtil;
import org.example.beelearning.service.StatsService;
import org.springframework.stereotype.Service;

import java.util.*;


import java.util.List;
import java.util.stream.Collectors;

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

    @Override
    public CourseStudentStatsResponse getMyCourseStats(Integer courseId, CourseStudentStatsRequest request) {

        Integer userId = SecurityUtil.getCurrentUser().getUserId();
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

    @Override
    public TeacherCourseStatsResponse getTeacherCourseStats(
            Integer courseId,
            User requester) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy khóa học"));
        String role = requester.getRole().name();
        boolean isAdmin = role.contains("ADMIN");
        boolean isTeacher = role.contains("TEACHER");
        if (isTeacher && !isAdmin) {
            Integer ownerTeacherId =
                    course.getTeacher() != null
                            ? course.getTeacher().getUserId()
                            : null;

            if (!requester.getUserId().equals(ownerTeacherId)) {
                throw new BusinessException("Bạn không quản lý khóa học này");
            }
        }
        long totalStudents = enrollmentRepository.countStudentsInCourse(courseId);
        long totalAssignments = assignmentRepository.countAssignmentsInCourse(courseId);
        long totalSubmissions = submissionRepository.countSubmissionsInCourse(courseId);
        long submittedStudents = submissionRepository.countDistinctStudentsSubmittedInCourse(courseId);
        Double avgScore = submissionRepository.avgScoreInCourse(courseId);
        Double rate =
                totalStudents > 0
                        ? (submittedStudents * 100.0) / totalStudents
                        : null;

        return new TeacherCourseStatsResponse(
                totalStudents,
                submittedStudents,
                totalAssignments,
                totalSubmissions,
                avgScore,
                rate
        );
    }
    @Override
    public List<CourseStatsCardResponse> getStatsForMyCourses() {

        Integer userId = SecurityUtil.getCurrentUser().getUserId();

        List<Enrollment> enrollments =
                enrollmentRepository.findByStudent_UserId(userId);

        return enrollments.stream()
                .map(Enrollment::getCourse)
                .distinct()
                .map(course -> {

                    long totalAssignments =
                            assignmentRepository
                                    .countAssignmentsInCourse(course.getCourseId());

                    long submittedAssignments =
                            submissionRepository
                                    .countDistinctAssignmentsSubmittedInCourse(
                                            course.getCourseId(), userId);

                    long pendingAssignments =
                            Math.max(0, totalAssignments - submittedAssignments);

                    String status =
                            (totalAssignments > 0 && submittedAssignments >= totalAssignments)
                                    ? "COMPLETED"
                                    : "ONGOING";

                    return CourseStatsCardResponse.builder()
                            .courseId(course.getCourseId())
                            .courseName(course.getName())
                            .description(course.getDescription())
                            .totalAssignments(totalAssignments)
                            .submittedAssignments(submittedAssignments)
                            .pendingAssignments(pendingAssignments)
                            .courseStatus(status)
                            .build();
                })
                .toList();
    }


    @Override
    public List<CourseStatsCardResponse> getStatsForTeacherCourses() {

        User teacher = SecurityUtil.getCurrentUser();

        List<Course> courses =
                courseRepository.findByTeacher_userId(teacher.getUserId());

        return courses.stream()
                .map(course -> buildTeacherCard(course))
                .toList();
    }

    @Override
    public List<CourseStatsCardResponse> getStatsForAllCourses() {

        return courseRepository.findAll().stream()
                .map(course -> buildTeacherCard(course))
                .toList();
    }
    @Override
    public CourseStudentDetailResponse getMyCourseDetail(Integer courseId) {
        Integer userId = SecurityUtil.getCurrentUser().getUserId();
        boolean enrolled = enrollmentRepository
                .existsByStudent_UserIdAndCourse_CourseId(userId, courseId);
        if (!enrolled) {
            throw new BusinessException("Bạn chưa đăng ký khóa học này");
        }
        List<Assignment> assignments = assignmentRepository.findAssignmentsByCourseId(courseId);
        List<Submission> mySubs = submissionRepository.findMySubmissionsInCourse(courseId, userId);
        Map<Integer, Submission> subByAid = mySubs.stream()
                .collect(Collectors.toMap(
                        s -> s.getAssignmentId().getAssignmentId(),
                        s -> s,
                        (a, b) -> {
                            // ưu tiên submission có submittedAt mới hơn (null-safe)
                            if (a.getSubmittedAt() == null) return b;
                            if (b.getSubmittedAt() == null) return a;
                            return a.getSubmittedAt().isAfter(b.getSubmittedAt()) ? a : b;
                        }
                ));

        List<CourseAssignmentItemResponse> submittedList = new ArrayList<>();
        List<CourseAssignmentItemResponse> pendingList = new ArrayList<>();

        for (Assignment a : assignments) {
            Submission s = subByAid.get(a.getAssignmentId());

            CourseAssignmentItemResponse item = CourseAssignmentItemResponse.builder()
                    .assignmentId(a.getAssignmentId())
                    .title(a.getTitle())
                    .deadline(a.getDeadline())
                    .maxScore(a.getMaxScore())
                    .submitted(s != null)
                    .score(s != null ? s.getScore() : null)
                    .submittedAt(s != null ? s.getSubmittedAt() : null)
                    .build();

            if (s != null) submittedList.add(item);
            else pendingList.add(item);
        }

        long total = assignments.size();
        long submitted = submittedList.size();
        long pending = pendingList.size();

        double progress = total == 0 ? 0.0 : (submitted * 100.0 / total);
        String status = (total > 0 && submitted >= total) ? "COMPLETED" : "ONGOING";

        return CourseStudentDetailResponse.builder()
                .totalAssignments(total)
                .submittedAssignments(submitted)
                .pendingAssignments(pending)
                .progressPercent(progress)
                .courseStatus(status)
                .submittedList(submittedList)
                .pendingList(pendingList)
                .build();
    }


    private CourseStatsCardResponse buildTeacherCard(Course course) {

        Integer courseId = course.getCourseId();
        long totalStudents = enrollmentRepository.countStudentsInCourse(courseId);
        long totalAssignments = assignmentRepository.countAssignmentsInCourse(courseId);
        long totalSubmissions = submissionRepository.countSubmissionsInCourse(courseId);
        long submittedStudents = submissionRepository.countDistinctStudentsSubmittedInCourse(courseId);
        Double avgScore = submissionRepository.avgScoreInCourse(courseId);
        Double rate =
                totalStudents > 0
                        ? (submittedStudents * 100.0) / totalStudents
                        : null;

        return CourseStatsCardResponse.builder()
                .courseId(courseId)
                .courseName(course.getName())
                .description(course.getDescription())
                .totalStudents(totalStudents)
                .submittedStudents(submittedStudents)
                .totalAssignments(totalAssignments)
                .totalSubmissions(totalSubmissions)
                .averageScore(avgScore)
                .submissionRate(rate)
                .build();
    }
}
