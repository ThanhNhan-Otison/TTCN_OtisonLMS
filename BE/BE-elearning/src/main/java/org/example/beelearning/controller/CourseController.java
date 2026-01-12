package org.example.beelearning.controller;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.assignment.AssignmentReqest;
import org.example.beelearning.dto.assignment.AssignmentResponse;
import org.example.beelearning.dto.course.CourseRequest;
import org.example.beelearning.dto.course.CourseResponse;
import org.example.beelearning.dto.submission.SubmissionTeacherResponse;
import org.example.beelearning.repository.CourseRepository;
import org.example.beelearning.security.CustomUserDetails;
import org.example.beelearning.service.CourseService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@CrossOrigin
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    public CourseResponse createCourse(@RequestBody CourseRequest req) {
        return courseService.createCourse(req);
    }

    @GetMapping
    public List<CourseResponse> getCourses(Authentication authentication) {

        boolean isAdmin = authentication != null &&
                authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return courseService.getAllCourses();
        }
        return courseService.getPublishedCourses();
    }

    @GetMapping("/teacher/{teacherId}")
    public List<CourseResponse> getByTeacher(@PathVariable Integer teacherId) {
        return courseService.getCoursesByTeacher(teacherId);
    }

    @GetMapping("/{id}")
    public CourseResponse getOne(@PathVariable Integer id) {
        return courseService.getCourse(id);
    }

    @PutMapping("/{id}")
    public CourseResponse update(@PathVariable Integer id,
                                 @RequestBody CourseRequest req) {
        return courseService.updateCourse(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        courseService.deleteCourse(id);
    }

    @GetMapping("/mine")
    public List<CourseResponse> myCreatedCourses(Authentication authentication) {
        CustomUserDetails cud = (CustomUserDetails) authentication.getPrincipal();
        Integer teacherId = cud.getUser().getUserId();
        return courseService.getCoursesByTeacher(teacherId); // bạn đã có service này
    }

    @GetMapping("/enrolled")
    public List<CourseResponse> myEnrolledCourses(Authentication authentication) {
        CustomUserDetails cud = (CustomUserDetails) authentication.getPrincipal();
        Integer userId = cud.getUser().getUserId();
        return courseService.getEnrolledCourses(userId);
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @GetMapping("/{courseId}/assignments")
    public List<AssignmentResponse> assignmentsByCourse(@PathVariable Integer courseId) {
        return courseService.getAssignmentsByCourse(courseId);
    }
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @GetMapping("/{courseId}/submissions")
    public List<SubmissionTeacherResponse> submissionsByCourse(@PathVariable Integer courseId) {
        return courseService.getSubmissionsByCourse(courseId);
    }
}

