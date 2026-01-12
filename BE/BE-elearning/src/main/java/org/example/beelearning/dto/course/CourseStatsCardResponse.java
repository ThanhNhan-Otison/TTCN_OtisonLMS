package org.example.beelearning.dto.course;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseStatsCardResponse {
    private Integer courseId;
    private String courseName;
    private String description;
    private Long totalAssignments;
    private Long submittedAssignments;
    private Long pendingAssignments;
    private String courseStatus;
    private Long totalStudents;
    private Long submittedStudents;
    private Long totalSubmissions;
    private Double averageScore;
    private Double submissionRate;
}