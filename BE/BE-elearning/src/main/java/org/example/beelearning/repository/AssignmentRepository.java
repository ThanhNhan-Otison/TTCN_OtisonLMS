package org.example.beelearning.repository;

import org.example.beelearning.entity.Assignment;
import org.example.beelearning.entity.Lesson;
import org.example.beelearning.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment,Integer> {
    List<Assignment> findByLessonId(Lesson assignmentId);

    Optional<Object> findByAssignmentId(Integer id);
}

