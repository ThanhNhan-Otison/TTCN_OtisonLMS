package org.example.beelearning.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.submission.SubmissionRequest;
import org.example.beelearning.dto.submission.SubmissionResponse;
import org.example.beelearning.entity.Assignment;
import org.example.beelearning.entity.Submission;

import org.example.beelearning.entity.User;
import org.example.beelearning.entity.enums.Role;
import org.example.beelearning.exception.BusinessException;
import org.example.beelearning.repository.AssignmentRepository;
import org.example.beelearning.repository.EnrollmentRepository;
import org.example.beelearning.repository.SubmissionRepository;
import org.example.beelearning.security.CustomUserDetails;
import org.example.beelearning.security.SecurityUtil;
import org.example.beelearning.service.SubmissionService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FileStrorageService fileStrorageService;


//    @Override
//    public SubmissionResponse submitAssignment(SubmissionRequest req) {
//
//        // Lấy user hiện tại = student
//        var auth = SecurityContextHolder.getContext().getAuthentication();
//        var principal = (CustomUserDetails) auth.getPrincipal();
//        var currentUser = principal.getUser();
//
//        if (currentUser.getRole() != Role.USER) {
//            throw new BusinessException("Chỉ sinh viên mới được nộp bài");
//        }
//
//        Assignment assignment = assignmentRepository.findById(req.getAssigmentId())
//                .orElseThrow(() -> new BusinessException("Không tìm thấy bài tập"));
//
//        // Check student đã đăng ký khóa học chứa lesson này chưa
//        Integer courseId = assignment.getLessonId().getCourse().getCourseId();
//        boolean enrolled = enrollmentRepository
//                .existsByStudent_UserIdAndCourse_CourseId(currentUser.getUserId(), courseId);
//
//        if (!enrolled) {
//            throw new BusinessException("Bạn chưa đăng ký khóa học, không được nộp bài");
//        }
//
//        // Nếu muốn cho phép nộp lại → tìm Submission cũ (nếu có) rồi update
//        Submission submission = submissionRepository
//                .findByAssignmentIdAndStudentId(assignment.getAssignmentId(), currentUser.getUserId())
//                .orElse(Submission.builder()
//                        .assignmentId(assignment)
//                        .studentId(currentUser)
//                        .build()
//                );
//
//        submission.setContent(req.getContent());
//        submission.setFileUrl(req.getFileUrl());
//        submission.setSubmittedAt(LocalDateTime.now());
//
//        submissionRepository.save(submission);
//        return toResponse(submission);
//    }


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

        List<Submission> list = submissionRepository.findByAssignmentId(assignmentId);
        return list.stream().map(this::toResponse).toList();
    }

    @Override
    public SubmissionResponse gradeSubmission(Integer submissionId, Integer score, String feedback) {
        // Chỉ TEACHER / ADMIN
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = (CustomUserDetails) auth.getPrincipal();
        var currentUser = principal.getUser();

        if (currentUser.getRole() != Role.TEACHER && currentUser.getRole() != Role.ADMIN) {
            throw new BusinessException("Chỉ giảng viên hoặc admin mới được chấm điểm");
        }

        Submission s = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bài nộp"));

        // có thể check thêm maxScore, deadline... tùy bạn
        s.setScore(score);
        s.setFeedback(feedback);

        submissionRepository.save(s);
        return toResponse(s);
    }

    private SubmissionResponse toResponse(Submission s) {
        return SubmissionResponse.builder()
                .submissionId(s.getSubmissionId())
                .assigmentId(s.getAssignmentId().getAssignmentId())
                .studentId(s.getStudentId().getUserId())
                .content(s.getContent())
                .fileUrl(s.getFileUrl())
                .submittedAt(s.getSubmittedAt())
                .score(s.getScore())
                .feedback(s.getFeedback())
                .build();
    }
}
