package org.example.beelearning.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.course.CourseRequest;
import org.example.beelearning.dto.course.CourseResponse;
import org.example.beelearning.entity.Course;
import org.example.beelearning.entity.User;
import org.example.beelearning.entity.enums.CourseStatus;
import org.example.beelearning.entity.enums.Role;
import org.example.beelearning.exception.BusinessException;
import org.example.beelearning.repository.CourseRepository;
import org.example.beelearning.repository.UserRepository;
import org.example.beelearning.security.CustomUserDetails;
import org.example.beelearning.service.CourseService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;


//@Override
//public CourseResponse createCourse(CourseRequest req) {
//
//    // 1) Lấy user hiện tại từ JWT (SecurityContext)
//    var auth = SecurityContextHolder.getContext().getAuthentication();
//    if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails cud)) {
//        throw new BusinessException("Chưa đăng nhập");
//    }
//    User teacher = cud.getUser();
//
//    // 2) CHỈ CHO PHÉP ROLE TEACHER (giữ nguyên ý của bạn)
//    if (teacher.getRole() != Role.TEACHER) {
//        throw new BusinessException("User này không phải giảng viên (ROLE_TEACHER)");
//    }
//
//    // 3) Tạo course như cũ
//    Course course = Course.builder()
//            .name(req.getName())
//            .description(req.getDescription())
//            .status(req.getStatus())
//            .teacher(teacher)
//            .build();
//
//    Course saved = courseRepository.save(course);
//    return toResponse(saved);
//}
@Override
public CourseResponse createCourse(CourseRequest req) {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    var principal = (CustomUserDetails) auth.getPrincipal();
    User teacher = principal.getUser(); // user hiện tại

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



//    @Override
//    public List<CourseResponse> getAllCourses() {
//        return courseRepository.findAll()
//                .stream()
//                .map(this::toResponse)
//                .toList();
//    }
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
    public CourseResponse updateCourse(Integer id, CourseRequest req) {
        Course c = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

        c.setName(req.getName());
        c.setDescription(req.getDescription());
        c.setStatus(req.getStatus());
        // nếu cho phép đổi giảng viên thì set lại teacher ở đây

        courseRepository.save(c);
        return toResponse(c);
    }

    @Override
    public void deleteCourse(Integer id) {
        courseRepository.deleteById(id);
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
