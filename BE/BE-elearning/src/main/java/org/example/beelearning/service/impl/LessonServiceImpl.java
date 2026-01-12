package org.example.beelearning.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.lesson.LessonRequest;
import org.example.beelearning.dto.lesson.LessonResponse;
import org.example.beelearning.entity.Course;
import org.example.beelearning.entity.Lesson;
import org.example.beelearning.entity.enums.Role;
import org.example.beelearning.exception.BusinessException;
import org.example.beelearning.repository.CourseRepository;
import org.example.beelearning.repository.EnrollmentRepository;
import org.example.beelearning.repository.LessonRepository;
import org.example.beelearning.security.CustomUserDetails;
import org.example.beelearning.service.LessonService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Override
    public LessonResponse createLesson(LessonRequest req) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = (CustomUserDetails) auth.getPrincipal();
        var currentUser = principal.getUser();


        if (currentUser.getRole() != Role.TEACHER && currentUser.getRole() != Role.ADMIN) {
            throw new BusinessException("Chỉ giảng viên hoặc admin mới được tạo bài học");
        }
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy khóa học"));
        Lesson lesson = Lesson.builder()
                .lessonName(req.getLessonName())
                .content(req.getContent())
                .videoUrl(req.getVideoUrl())
                .fileUrl(req.getFileUrl())
                .course(course)
                .build();
        lessonRepository.save(lesson);
        return toResponse(lesson);
    }

    @Override
    public LessonResponse updateLesson(Integer id, LessonRequest req) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bài học"));
        if (req.getLessonName() != null)  lesson.setLessonName(req.getLessonName());
        if (req.getContent() != null) lesson.setContent(req.getContent());
        if (req.getVideoUrl() != null) lesson.setVideoUrl(req.getVideoUrl());
        if (req.getCourseId() != null) {
            Course course = courseRepository.findById(req.getCourseId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy khóa học"));
            lesson.setCourse(course);
        }
        lessonRepository.save(lesson);
        return toResponse(lesson);
    }

    @Override
    public void deleteLesson(Integer id) {
        if (!lessonRepository.existsById(id)) {
            throw new BusinessException("Không tìm thấy bài học để xóa");
        }
        lessonRepository.deleteById(id);
    }

    @Override
    public LessonResponse getlessonId(Integer lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy bài học"));
        Course course = lesson.getCourse();
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = (CustomUserDetails) auth.getPrincipal();
        var currentUser = principal.getUser();
        if (currentUser.getRole() == Role.USER) {
            boolean enrolled = enrollmentRepository
                    .existsByStudent_UserIdAndCourse_CourseId(currentUser.getUserId(), course.getCourseId());
            if (!enrolled) {
                throw new BusinessException("Bạn chưa đăng ký khóa học này, không được xem bài học");
            }
        }
        return toResponse(lesson);
    }

    @Override
    public List<LessonResponse> getcourseId(Integer courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(()-> new BusinessException("không tìm thấy khóa học "));

        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = (CustomUserDetails) auth.getPrincipal();
        var currentUser = principal.getUser();

        if (currentUser.getRole() == Role.USER) {
            boolean enrolled = enrollmentRepository
                    .existsByStudent_UserIdAndCourse_CourseId(currentUser.getUserId(), course.getCourseId());

            if (!enrolled) {
                throw new BusinessException("Bạn chưa đăng ký khóa học này, không được xem danh sách bài học");
            }
        }

        return lessonRepository.findByCourse_courseId(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private LessonResponse toResponse(Lesson lesson) {
        LessonResponse dto = new LessonResponse();
        dto.setLessonId(lesson.getLessonId());
        dto.setLessonName(lesson.getLessonName());
        dto.setContent(lesson.getContent());
        dto.setVideoUrl(lesson.getVideoUrl());
        dto.setFileUrl(lesson.getFileUrl());
        dto.setCourseId(lesson.getCourse().getCourseId());
        dto.setCourseName(lesson.getCourse().getName());
        return dto;
    }
}
