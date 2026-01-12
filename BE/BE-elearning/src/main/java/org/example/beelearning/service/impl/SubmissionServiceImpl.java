package org.example.beelearning.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.submission.SubmissionRequest;
import org.example.beelearning.dto.submission.SubmissionResponse;
import org.example.beelearning.dto.submission.SubmissionStatsResponse;
import org.example.beelearning.dto.submission.SubmissionTeacherResponse;
import org.example.beelearning.entity.*;

import org.example.beelearning.entity.enums.Role;
import org.example.beelearning.exception.BusinessException;
import org.example.beelearning.repository.AssignmentRepository;
import org.example.beelearning.repository.EnrollmentRepository;
import org.example.beelearning.repository.SubmissionRepository;
import org.example.beelearning.security.CustomUserDetails;
import org.example.beelearning.security.SecurityUtil;
import org.example.beelearning.service.EmailService;
import org.example.beelearning.service.SubmissionService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FileStrorageService fileStrorageService;
    private final EmailService emailService;


    private void ensureTeacherOwnsAssignmentOrAdmin(User currentUser, Integer assignmentId) {
        if (currentUser.getRole() == Role.ADMIN) return;

        Assignment a = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bài tập"));

        Lesson lesson = a.getLessonId();
        Course course = lesson.getCourse();
        User teacher = course.getTeacher();

        if (teacher == null || teacher.getUserId() == null) {
            throw new BusinessException("Không xác định được giảng viên của khóa học");
        }

        if (!teacher.getUserId().equals(currentUser.getUserId())) {
            throw new BusinessException("Bạn không có quyền xem/chấm bài nộp của bài tập này");
        }
    }

    @Override
    public List<SubmissionTeacherResponse> getSubmissionsForMyCourses() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = (CustomUserDetails) auth.getPrincipal();
        var currentUser = principal.getUser();

        if (currentUser.getRole() != Role.TEACHER && currentUser.getRole() != Role.ADMIN) {
            throw new BusinessException("Chỉ giảng viên hoặc admin mới xem được danh sách bài nộp");
        }

        // ADMIN: tuỳ bạn muốn xem tất cả hay vẫn theo teacherId
        Integer teacherId = currentUser.getUserId();

        List<Submission> list = submissionRepository.findAllByTeacher(teacherId);

        return list.stream().map(this::toTeacherResponse).toList();
    }

    private SubmissionTeacherResponse toTeacherResponse(Submission s) {
        Assignment a = s.getAssignmentId();
        Lesson l = a.getLessonId();
        Course c = l.getCourse();
        User st = s.getStudentId();

        return SubmissionTeacherResponse.builder()
                .submissionId(s.getSubmissionId())
                .assignmentId(a.getAssignmentId())
                .assignmentTitle(a.getTitle())

                .lessonId(l.getLessonId())
                .lessonName(l.getLessonName())

                .courseId(c.getCourseId())
                .courseName(c.getName())

                .studentId(st.getUserId())
                .studentName(st.getFirstName())      // nếu field tên là ten
                .studentEmail(st.getEmail())

                .content(s.getContent())
                .fileUrl(s.getFileUrl())
                .submittedAt(s.getSubmittedAt())
                .score(s.getScore())
                .feedback(s.getFeedback())
                .build();
    }

    @Override
    public List<SubmissionResponse> getMySubmissions() {
        User student = SecurityUtil.getCurrentUser();
        List<Submission> list = submissionRepository.findByStudentId_UserId(student.getUserId());
        return list.stream().map(this::toResponse).toList();
    }

    @Override
    public SubmissionStatsResponse getStatsOfAssignment(Integer assignmentId) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = (CustomUserDetails) auth.getPrincipal();
        var currentUser = principal.getUser();

        if (currentUser.getRole() != Role.TEACHER && currentUser.getRole() != Role.ADMIN) {
            throw new BusinessException("Chỉ giảng viên hoặc admin mới xem thống kê");
        }

        ensureTeacherOwnsAssignmentOrAdmin(currentUser, assignmentId);

        long total = submissionRepository.countTotalSubmissionsByAssignment(assignmentId);
        long students = submissionRepository.countDistinctStudentsByAssignment(assignmentId);

        return new SubmissionStatsResponse(assignmentId, total, students);
    }


    @Override
    public SubmissionResponse submit(Integer assignmentId, String content, MultipartFile file) {

        User student = SecurityUtil.getCurrentUser();

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));


        String fileUrl = null;
        if (file != null && !file.isEmpty()) {
            try {
                fileUrl = fileStrorageService.saveSubmissionFile(file);
            } catch (IOException e) {
                throw new RuntimeException("Lỗi lưu file bài nộp", e);
            }
        }

        Submission submission = Submission.builder()
                .assignmentId(assignment)
                .studentId(student)
                .content(content)
                .fileUrl(fileUrl)
                .submittedAt(LocalDateTime.now())
                .build();


        Submission saved = submissionRepository.save(submission);
        return SubmissionResponse.fromEntity(saved);
    }


    @Override
    public List<SubmissionResponse> getSubmissionsOfAssignment(Integer assignmentId) {
        // Chỉ TEACHER / ADMIN
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = (CustomUserDetails) auth.getPrincipal();
        var currentUser = principal.getUser();

        if (currentUser.getRole() != Role.TEACHER && currentUser.getRole() != Role.ADMIN) {
            throw new BusinessException("Chỉ giảng viên hoặc admin mới được xem danh sách bài nộp");
        }
        ensureTeacherOwnsAssignmentOrAdmin(currentUser, assignmentId);

        List<Submission> list = submissionRepository.findByAssignmentId_AssignmentId(assignmentId);

        return list.stream().map(this::toResponse).toList();
    }

    @Override
    public Map<String, Long> getTeacherStats() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = (CustomUserDetails) auth.getPrincipal();
        var currentUser = principal.getUser();

        // chỉ teacher/admin (nếu bạn muốn chặt hơn)
        if (currentUser.getRole() != Role.TEACHER && currentUser.getRole() != Role.ADMIN) {
            throw new BusinessException("Chỉ giảng viên hoặc admin mới xem thống kê");
        }

        long total = submissionRepository.countAllByTeacher(currentUser.getUserId());
        long students = submissionRepository.countDistinctStudentsByTeacher(currentUser.getUserId());

        return Map.of(
                "totalSubmissions", total,
                "totalStudents", students
        );
    }



//    @Override
//    public SubmissionResponse gradeSubmission(Integer submissionId, Integer score, String feedback) {
//        // Chỉ TEACHER / ADMIN
//        var auth = SecurityContextHolder.getContext().getAuthentication();
//        var principal = (CustomUserDetails) auth.getPrincipal();
//        var currentUser = principal.getUser();
//
//        if (currentUser.getRole() != Role.TEACHER && currentUser.getRole() != Role.ADMIN) {
//            throw new BusinessException("Chỉ giảng viên hoặc admin mới được chấm điểm");
//        }
//
//        Submission s = submissionRepository.findById(submissionId)
//                .orElseThrow(() -> new BusinessException("Không tìm thấy bài nộp"));
//
//
//        Integer assignmentId = s.getAssignmentId().getAssignmentId();
//        ensureTeacherOwnsAssignmentOrAdmin(currentUser, assignmentId);
//
//
//        // có thể check thêm maxScore, deadline... tùy bạn
//        s.setScore(score);
//        s.setFeedback(feedback);
//
//        submissionRepository.save(s);
//        return toResponse(s);
//    }
//
@Override
public SubmissionResponse gradeSubmission(Integer submissionId, Integer score, String feedback, boolean notify) {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    var principal = (CustomUserDetails) auth.getPrincipal();
    var currentUser = principal.getUser();

    if (currentUser.getRole() != Role.TEACHER && currentUser.getRole() != Role.ADMIN) {
        throw new BusinessException("Chỉ giảng viên hoặc admin mới được chấm điểm");
    }

    Submission s = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new BusinessException("Không tìm thấy bài nộp"));

    Integer assignmentId = s.getAssignmentId().getAssignmentId();
    ensureTeacherOwnsAssignmentOrAdmin(currentUser, assignmentId);

    s.setScore(score);
    s.setFeedback(feedback);
    submissionRepository.save(s);

    // ===== Gửi mail nếu notify=true =====
    if (notify) {
        User student = s.getStudentId();
        Assignment a = s.getAssignmentId();

        String toEmail = student.getEmail();
        String studentName = student.getFirstName(); // hoặc fullName tùy bạn
        String assignmentTitle = a.getTitle();

        if (toEmail != null && !toEmail.isBlank()) {
            emailService.sendGradeNotification(
                    toEmail,
                    studentName,
                    assignmentTitle,
                    score,
                    feedback
            );
        }
    }

    return toResponse(s);
}

    private SubmissionResponse toResponse(Submission s) {
        return SubmissionResponse.builder()
                .submissionId(s.getSubmissionId())
                .assignmentId(s.getAssignmentId().getAssignmentId())
                .studentId(s.getStudentId().getUserId())
                .content(s.getContent())
                .fileUrl(s.getFileUrl())
                .submittedAt(s.getSubmittedAt())
                .score(s.getScore())
                .feedback(s.getFeedback())
                .build();
    }
}
