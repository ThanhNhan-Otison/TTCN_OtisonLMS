package org.example.beelearning.dto.assignment;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter
public class AssignmentReqest {
    private Integer lessonId;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private Integer maxScore;

}
