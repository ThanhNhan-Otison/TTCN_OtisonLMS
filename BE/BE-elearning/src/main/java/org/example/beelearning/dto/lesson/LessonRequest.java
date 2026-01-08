package org.example.beelearning.dto.lesson;

import lombok.Data;

@Data
public class LessonRequest {
    private String lessonName;
    private String content;
    private String videoUrl;
    private Integer courseId; //kh chua bai nay
    private String fileUrl;

}
