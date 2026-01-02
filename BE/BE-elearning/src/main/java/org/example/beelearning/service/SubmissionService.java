package org.example.beelearning.service;

import org.example.beelearning.dto.submission.SubmissionRequest;
import org.example.beelearning.dto.submission.SubmissionResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SubmissionService {
    SubmissionResponse submit(Integer assignmentId, String content, MultipartFile file);
    List<SubmissionResponse> getSubmissionsOfAssignment(Integer assignmentId);   // cho GV xem
    SubmissionResponse gradeSubmission(Integer submissionId, Integer score, String feedback);
}
