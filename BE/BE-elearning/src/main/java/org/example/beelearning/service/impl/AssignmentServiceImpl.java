package org.example.beelearning.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.assignment.AssignmentReqest;
import org.example.beelearning.dto.assignment.AssignmentResponse;
import org.example.beelearning.entity.Assignment;
import org.example.beelearning.entity.Lesson;
import org.example.beelearning.entity.enums.Role;
import org.example.beelearning.exception.BusinessException;
import org.example.beelearning.repository.AssignmentRepository;
import org.example.beelearning.repository.LessonRepository;
import org.example.beelearning.security.CustomUserDetails;
import org.example.beelearning.service.AssignmentService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentServiceImpl implements AssignmentService {
    private final AssignmentRepository assignmentRepository;
    private final LessonRepository lessonRepository;

    @Override
    public AssignmentResponse createAssignment(AssignmentReqest req) {
//        // Chỉ TEACHER hoặc ADMIN
//        var auth = SecurityContextHolder.getContext().getAuthentication();
//        var principal = (CustomUserDetails) auth.getPrincipal();
//        var currentUser = principal.getUser();
//
//        if (currentUser.getRole() != Role.TEACHER && currentUser.getRole() != Role.ADMIN) {
//            throw new BusinessException("Chỉ giảng viên hoặc admin mới được tạo bài tập");
//        }

        Lesson lesson = lessonRepository.findById(req.getLessonId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy bài học"));

        Assignment a = Assignment.builder()
                .lessonId(lesson)
                .title(req.getTitle())
                .description(req.getDescription())
                .deadline(req.getDeadline())
                .maxScore(req.getMaxScore())
                .build();

        assignmentRepository.save(a);
        return toResponse(a);
    }

    @Override
    public List<AssignmentResponse> getAssignmentsBylessonId(Integer lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bài học"));

        return assignmentRepository.findByLessonId(lesson)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public AssignmentResponse getAssignmentById(Integer id) {
        Assignment a = assignmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bài tập"));
        return toResponse(a);
    }

    @Override
    public List<AssignmentResponse> getAllAssignments() {
        return assignmentRepository.findAll()
                .stream().map(this::toResponse).toList();
    }
    private AssignmentResponse toResponse(Assignment a) {
        return AssignmentResponse.builder()
                .assignmentId(a.getAssignmentId())
                .lessonId(a.getLessonId().getLessonId())
                .title(a.getTitle())
                .description(a.getDescription())
                .deadline(a.getDeadline())
                .maxScore(a.getMaxScore())
                .build();
    }

}
