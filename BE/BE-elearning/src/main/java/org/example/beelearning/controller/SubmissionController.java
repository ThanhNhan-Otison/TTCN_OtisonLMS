package org.example.beelearning.controller;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.submission.SubmissionRequest;
import org.example.beelearning.dto.submission.SubmissionResponse;
import org.example.beelearning.service.SubmissionService;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
public class SubmissionController {
    private final SubmissionService submissionService;
    // Student nộp bài
//    @PreAuthorize("hasRole('USER')")
//    @PostMapping
//    public SubmissionResponse submit(@RequestBody SubmissionRequest req) {
//        return submissionService.submitAssignment(req);
//    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER')")
    public SubmissionResponse submit(
            @RequestParam Integer assignmentId,
            @RequestParam(required = false) String content,
            @RequestPart(required = false) MultipartFile file
    ) {
        return submissionService.submit(assignmentId, content, file);
    }


    // GV xem danh sách bài nộp của một bài tập
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @GetMapping("/assignments/{assignmentId}")
    public List<SubmissionResponse> getByAssignment(@PathVariable Integer assignmentId) {
        return submissionService.getSubmissionsOfAssignment(assignmentId);
    }

    // GV chấm điểm
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PostMapping("/{submissionId}/grade")
    public SubmissionResponse grade(
            @PathVariable Integer submissionId,
            @RequestParam Integer score,
            @RequestParam(required = false) String feedback
    ) {
        return submissionService.gradeSubmission(submissionId, score, feedback);
    }
}
