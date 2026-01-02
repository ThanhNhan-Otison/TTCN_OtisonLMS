package org.example.beelearning.dto.assignment;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
@Builder
public class AssignmentResponse {
    private Integer assignmentId;
    private Integer lessonId;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private Integer maxScore;
}
