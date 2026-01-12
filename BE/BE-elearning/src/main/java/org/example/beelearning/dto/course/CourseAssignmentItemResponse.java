package org.example.beelearning.dto.course;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseAssignmentItemResponse {
    private Integer assignmentId;
    private String title;
    private LocalDateTime deadline;
    private Integer maxScore;
    private boolean submitted;
    private Integer score;
    private LocalDateTime submittedAt;
}
