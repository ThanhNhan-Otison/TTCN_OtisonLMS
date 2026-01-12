package org.example.beelearning.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.assignment.AssignmentResponse;
import org.example.beelearning.dto.course.CourseRequest;
import org.example.beelearning.dto.course.CourseResponse;
import org.example.beelearning.dto.submission.SubmissionTeacherResponse;
import org.example.beelearning.entity.*;
import org.example.beelearning.entity.enums.CourseStatus;
import org.example.beelearning.entity.enums.Role;
import org.example.beelearning.exception.BusinessException;
import org.example.beelearning.repository.*;
import org.example.beelearning.security.CustomUserDetails;
import org.example.beelearning.service.CourseService;
import org.example.beelearning.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;


    @Override
public CourseResponse createCourse(CourseRequest req) {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    var principal = (CustomUserDetails) auth.getPrincipal();
    User teacher = principal.getUser();

    if (teacher.getRole() != Role.TEACHER) {
        throw new BusinessException("Chỉ giảng viên (TEACHER) mới được tạo khóa học");
    }

    Course course = Course.builder()
            .name(req.getName())
            .description(req.getDescription())
            .status(req.getStatus())
            .teacher(teacher)
            .build();

    courseRepository.save(course);
    return toResponse(course);
}


    @Override
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<CourseResponse> getPublishedCourses() {
        return courseRepository.findByStatus(CourseStatus.publish)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<CourseResponse> getCoursesByTeacher(Integer teacherId) {
        return courseRepository.findByTeacher_userId(teacherId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CourseResponse getCourse(Integer id) {
        Course c = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));
        return toResponse(c);
    }
    @Override
    public List<CourseResponse> getEnrolledCourses(Integer userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudent_UserId(userId);

        return enrollments.stream()
                .map(Enrollment::getCourse)
                .filter(c -> c.getStatus() == CourseStatus.publish) // nếu bạn chỉ muốn show published
                .map(this::toResponse) // hàm map Course -> CourseResponse bạn đang có
                .toList();
    }
    @Override
    public List<AssignmentResponse> getAssignmentsByCourse(Integer courseId) {

        courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy khóa học"));

        return assignmentRepository.findAssignmentsByCourseId(courseId)
                .stream()
                .map(a -> {
                    AssignmentResponse res = new AssignmentResponse();
                    res.setAssignmentId(a.getAssignmentId());
                    res.setTitle(a.getTitle());
                    res.setDescription(a.getDescription());
                    res.setDeadline(a.getDeadline());
                    res.setMaxScore(a.getMaxScore());
                    return res;
                })
                .toList();
    }
    @Override
    public List<SubmissionTeacherResponse> getSubmissionsByCourse(Integer courseId) {

        courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy khóa học"));

        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = (CustomUserDetails) auth.getPrincipal();
        User current = principal.getUser();

        if (current.getRole() != Role.TEACHER && current.getRole() != Role.ADMIN) {
            throw new BusinessException("Không có quyền xem danh sách bài nộp");
        }


        if (current.getRole() == Role.TEACHER) {
            Course c = courseRepository.findById(courseId).get();
            Integer ownerTeacherId = c.getTeacher() != null ? c.getTeacher().getUserId() : null;
            if (ownerTeacherId == null || !ownerTeacherId.equals(current.getUserId())) {
                throw new BusinessException("Bạn không quản lý khóa học này");
            }
        }


        Integer teacherId = (current.getRole() == Role.ADMIN) ? current.getUserId() : current.getUserId();
        List<Submission> all = submissionRepository.findAllByTeacher(teacherId);


        return all.stream()
                .filter(s -> {
                    Course c = s.getAssignmentId().getLessonId().getCourse();
                    return c != null && c.getCourseId().equals(courseId);
                })
                .map(s -> {
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
                            .studentName(st.getFirstName())
                            .studentEmail(st.getEmail())
                            .content(s.getContent())
                            .fileUrl(s.getFileUrl())
                            .submittedAt(s.getSubmittedAt())
                            .score(s.getScore())
                            .feedback(s.getFeedback())
                            .build();
                })
                .toList();
    }


    @Override
    public CourseResponse updateCourse(Integer id, CourseRequest req) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = (CustomUserDetails) auth.getPrincipal();
        User current = principal.getUser();

        Course c = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));


        if (current.getRole() == Role.TEACHER &&
                !c.getTeacher().getUserId().equals(current.getUserId())) {
            throw new BusinessException("Bạn không có quyền sửa khóa học này");
        }

        c.setName(req.getName());
        c.setDescription(req.getDescription());
        c.setStatus(req.getStatus());

        courseRepository.save(c);
        return toResponse(c);
    }

    @Override
    public void deleteCourse(Integer id) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = (CustomUserDetails) auth.getPrincipal();
        User current = principal.getUser();

        Course c = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

        if (current.getRole() == Role.TEACHER &&
                !c.getTeacher().getUserId().equals(current.getUserId())) {
            throw new BusinessException("Bạn không có quyền xóa khóa học này");
        }

        courseRepository.delete(c);
    }


    @Override
    public void updateStatus(Integer courseId, CourseStatus status) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course không tồn tại"));

        course.setStatus(status);
        courseRepository.save(course);
    }

    private CourseResponse toResponse(Course c) {
        CourseResponse dto = new CourseResponse();
        dto.setId(c.getCourseId());
        dto.setName(c.getName());
        dto.setDescription(c.getDescription());
        dto.setStatus(c.getStatus());
        dto.setTeacherId(c.getTeacher().getUserId());
        dto.setTeacherName(c.getTeacher().getFirstName());
        return dto;
    }
}
