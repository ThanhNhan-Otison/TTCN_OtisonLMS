package org.example.beelearning.dto.submission;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionTeacherResponse {
    private Integer submissionId;

    private Integer assignmentId;
    private String assignmentTitle;

    private Integer lessonId;
    private String lessonName;

    private Integer courseId;
    private String courseName;

    private Integer studentId;
    private String studentName;
    private String studentEmail;

    private String content;
    private String fileUrl;
    private LocalDateTime submittedAt;

    private Integer score;
    private String feedback;
}

