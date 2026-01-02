package org.example.beelearning.service;

import org.example.beelearning.dto.lesson.LessonRequest;
import org.example.beelearning.dto.lesson.LessonResponse;
import org.example.beelearning.entity.Lesson;

import java.util.List;

public interface LessonService {
    LessonResponse createLesson(LessonRequest lessonRequest);
    LessonResponse updateLesson(Integer lessonId, LessonRequest lessonRequest);
    void deleteLesson(Integer lessonId);
    LessonResponse getlessonId(Integer lessonId);
    List<LessonResponse> getcourseId(Integer courseId);

}
