package org.example.beelearning.dto.course;

import lombok.*;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseStudentDetailResponse {
    private Long totalAssignments;
    private Long submittedAssignments;
    private Long pendingAssignments;
    private Double progressPercent;
    private String courseStatus;
    private List<CourseAssignmentItemResponse> submittedList;
    private List<CourseAssignmentItemResponse> pendingList;
}
