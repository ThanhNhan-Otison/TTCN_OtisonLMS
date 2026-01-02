package org.example.beelearning.dto.submission;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.example.beelearning.entity.Submission;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class SubmissionResponse {
    private Integer submissionId;
    private Integer assignmentId;
    private Integer studentId;
    private String content;
    private String fileUrl;
    private String description;
    private LocalDateTime submittedAt;
    private Integer score;
    private String feedback;
    public static SubmissionResponse fromEntity(Submission s) {
        if (s == null) return null;

        return SubmissionResponse.builder()
                .submissionId(s.getSubmissionId())
                .assignmentId(s.getAssignmentId() != null ? s.getAssignmentId().getAssignmentId() : null)
                .studentId(s.getStudentId() != null ? s.getStudentId().getUserId() : null) // nếu User PK là userId thì đổi getId() -> getUserId()
                .content(s.getContent())
                .fileUrl(s.getFileUrl())
                .submittedAt(s.getSubmittedAt())
                .score(s.getScore())
                .feedback(s.getFeedback())
                .build();
    }

}

