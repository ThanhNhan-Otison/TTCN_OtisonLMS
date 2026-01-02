package org.example.beelearning.repository;

import org.example.beelearning.entity.Assignment;
import org.example.beelearning.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission,Integer> {

    // Sinh viên xem bài nộp của chính mình cho 1 bài tập
    Optional<Submission>  findByAssignmentIdAndStudentId(Integer assignmentId,Integer studentId);

    List<Submission> findByAssignmentId(Integer assignmentId);

}
