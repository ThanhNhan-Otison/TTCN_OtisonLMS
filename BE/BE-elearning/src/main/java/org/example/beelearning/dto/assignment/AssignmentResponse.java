package org.example.beelearning.dto.assignment;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AssignmentResponse {
    private Integer assignmentId;
    private Integer lessonId;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private Integer maxScore;
}
