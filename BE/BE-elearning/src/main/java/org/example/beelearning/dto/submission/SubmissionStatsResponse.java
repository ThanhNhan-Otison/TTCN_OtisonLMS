package org.example.beelearning.dto.submission;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SubmissionStatsResponse {
    private Integer assignmentId;
    private long totalSubmissions;
    private long totalStudentsSubmitted;
}

