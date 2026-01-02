package org.example.beelearning.controller;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.course.CourseRequest;
import org.example.beelearning.dto.course.CourseResponse;
import org.example.beelearning.repository.CourseRepository;
import org.example.beelearning.service.CourseService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@CrossOrigin
public class CourseController {

    private final CourseService courseService;

    // TẠO KHÓA HỌC – DÙNG POST
    @PostMapping
    public CourseResponse createCourse(@RequestBody CourseRequest req) {
        return courseService.createCourse(req);
    }

    // LẤY DANH SÁCH TẤT CẢ KHÓA HỌC – DÙNG GET
//    @GetMapping
//    public List<CourseResponse> getAll() {
//        return courseService.getAllCourses();
//    }
    @GetMapping
    public List<CourseResponse> getCourses(Authentication authentication) {

        boolean isAdmin = authentication != null &&
                authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return courseService.getAllCourses(); // ADMIN thấy tất cả
        }

        return courseService.getPublishedCourses(); // USER / TEACHER
    }


    // LẤY KHÓA HỌC THEO GIẢNG VIÊN – GET /api/v1/courses/teacher/{teacherId}
    @GetMapping("/teacher/{teacherId}")
    public List<CourseResponse> getByTeacher(@PathVariable Integer teacherId) {
        return courseService.getCoursesByTeacher(teacherId);
    }

    // LẤY CHI TIẾT 1 KHÓA HỌC – GET /api/v1/courses/{id}
    @GetMapping("/{id}")
    public CourseResponse getOne(@PathVariable Integer id) {
        return courseService.getCourse(id);
    }

    // CẬP NHẬT KHÓA HỌC – PUT /api/v1/courses/{id}
    @PutMapping("/{id}")
    public CourseResponse update(@PathVariable Integer id,
                                 @RequestBody CourseRequest req) {
        return courseService.updateCourse(id, req);
    }

    // XÓA KHÓA HỌC – DELETE /api/v1/courses/{id}
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        courseService.deleteCourse(id);
    }
}

