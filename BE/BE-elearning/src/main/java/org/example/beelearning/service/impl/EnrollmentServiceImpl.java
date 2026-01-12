package org.example.beelearning.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.beelearning.entity.Enrollment;
import org.example.beelearning.dto.enrollment.EnrollRequest;
import org.example.beelearning.dto.enrollment.EnrollmentResponse;
import org.example.beelearning.entity.Course;
import org.example.beelearning.entity.User;
import org.example.beelearning.entity.enums.Role;
import org.example.beelearning.exception.BusinessException;
import org.example.beelearning.repository.CourseRepository;
import org.example.beelearning.repository.EnrollmentRepository;
import org.example.beelearning.repository.UserRepository;
import org.example.beelearning.security.CustomUserDetails;
import org.example.beelearning.service.EnrollmentService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null || "anonymousUser".equals(auth.getPrincipal())) {
            throw new BusinessException("Chưa đăng nhập");
        }
        if (!(auth.getPrincipal() instanceof CustomUserDetails cud)) {
            throw new BusinessException("Principal không hợp lệ (kiểm tra CustomUserDetails)");
        }
        return cud.getUser();
    }

    @Override
    @Transactional
    public EnrollmentResponse enrollCourse(EnrollRequest req) {
        if (req.getCourseId() == null) throw new BusinessException("courseId không được null");

        User student = getCurrentUser(); //  luôn lấy từ auth

        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy khóa học"));

        boolean existed = enrollmentRepository.existsByStudent_UserIdAndCourse_CourseId(
                student.getUserId(), course.getCourseId()
        );
        if (existed) throw new BusinessException("Bạn đã đăng ký khóa học này rồi");

        Enrollment e = Enrollment.builder()
                .student(student)
                .course(course)
                .registrationDate(LocalDateTime.now())
                .build();

        enrollmentRepository.save(e);
        return toResponse(e);
    }

    @Override
    public List<EnrollmentResponse> myEnrollments() {
        User student = getCurrentUser();
        return enrollmentRepository.findByStudent_UserId(student.getUserId())
                .stream().map(this::toResponse).toList();
    }
    @Override
    public List<EnrollmentResponse> getByCourse(Integer courseId) {
        return enrollmentRepository.findBycourse_courseId(courseId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<EnrollmentResponse> getCourseofStudent(Integer studentId) {
        return enrollmentRepository.findByStudent_UserId(studentId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<EnrollmentResponse> getStudentofCourse(Integer courseId) {
        return enrollmentRepository.findBycourse_courseId(courseId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<EnrollmentResponse> getMyEnrollments() {
        return myEnrollments();
    }


    private EnrollmentResponse toResponse(Enrollment e) {
        EnrollmentResponse res = new EnrollmentResponse();
        res.setEnrollmentId(e.getId());
        res.setStudentId(e.getStudent().getUserId());
        res.setStudentName(e.getStudent().getFirstName());
        res.setCourseId(e.getCourse().getCourseId());
        res.setCourseName(e.getCourse().getName());
        res.setRegisteredAt(e.getRegistrationDate().toString());
        return res;
    }
}
