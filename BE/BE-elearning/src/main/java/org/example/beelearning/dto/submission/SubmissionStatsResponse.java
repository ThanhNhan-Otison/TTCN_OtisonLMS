package org.example.beelearning.dto.submission;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SubmissionStatsResponse {
    private Integer assignmentId;
    private long totalSubmissions;     // tổng lượt nộp
    private long totalStudentsSubmitted; // số sinh viên distinct đã nộp
}