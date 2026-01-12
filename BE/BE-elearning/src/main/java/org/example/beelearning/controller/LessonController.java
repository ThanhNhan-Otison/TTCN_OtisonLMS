package org.example.beelearning.controller;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.lesson.LessonRequest;
import org.example.beelearning.dto.lesson.LessonResponse;
import org.example.beelearning.service.LessonService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lessons")
@RequiredArgsConstructor
@CrossOrigin
public class LessonController {
    private final LessonService lessonService;

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PostMapping
    public LessonResponse createLesson(@RequestBody LessonRequest lessonRequest) {
        return lessonService.createLesson(lessonRequest);
    }

    @PutMapping("/{id}")
    public LessonResponse updateLesson(@PathVariable Integer id,
                                       @RequestBody LessonRequest lessonRequest) {
        return lessonService.updateLesson(id, lessonRequest);
    }

    @DeleteMapping("/{id}")
    public void deleteLesson(@PathVariable Integer id) {
        lessonService.deleteLesson(id);
    }

    @PreAuthorize("hasAnyRole('USER','TEACHER','ADMIN')")
    @GetMapping("/{id}")
    public LessonResponse getLessonById(@PathVariable Integer id) {
        return lessonService.getlessonId(id);
    }

    @PreAuthorize("hasAnyRole('USER','TEACHER','ADMIN')")
    @GetMapping("/course/{courseId}")
    public List<LessonResponse> getLessonsByCourseId(@PathVariable Integer courseId) {
        return lessonService.getcourseId(courseId);
    }
}
