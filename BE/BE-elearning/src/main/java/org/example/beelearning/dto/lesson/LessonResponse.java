package org.example.beelearning.dto.lesson;

import jakarta.persistence.JoinColumn;
import lombok.Data;
import org.example.beelearning.entity.Course;

@Data
public class LessonResponse {
    private Integer lessonId;
    private String lessonName;
    private String content;
    private String videoUrl;
    private Integer courseId;
    private String courseName;
}
