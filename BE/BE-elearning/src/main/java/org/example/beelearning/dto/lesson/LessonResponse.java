package org.example.beelearning.dto.lesson;


import lombok.Data;


@Data
public class LessonResponse {
    private Integer lessonId;
    private String lessonName;
    private String content;
    private String videoUrl;
    private Integer courseId;
    private String courseName;
    private String fileUrl;
}
