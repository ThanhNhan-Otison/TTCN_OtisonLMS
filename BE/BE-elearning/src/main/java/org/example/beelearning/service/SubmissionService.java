package org.example.beelearning.service;

import org.example.beelearning.dto.submission.SubmissionRequest;
import org.example.beelearning.dto.submission.SubmissionResponse;
import org.example.beelearning.dto.submission.SubmissionStatsResponse;
import org.example.beelearning.dto.submission.SubmissionTeacherResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface SubmissionService {
    SubmissionResponse submit(Integer assignmentId, String content, MultipartFile file);
    List<SubmissionResponse> getSubmissionsOfAssignment(Integer assignmentId);   // cho GV xem
//    SubmissionResponse gradeSubmission(Integer submissionId, Integer score, String feedback);
    List<SubmissionResponse> getMySubmissions();
    SubmissionStatsResponse getStatsOfAssignment(Integer assignmentId);
    List<SubmissionTeacherResponse> getSubmissionsForMyCourses();
    Map<String, Long> getTeacherStats();
    SubmissionResponse gradeSubmission(
            Integer submissionId,
            Integer score,
            String feedback,
            boolean notify
    );


}
