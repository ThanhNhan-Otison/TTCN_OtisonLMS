package org.example.beelearning.repository;

import org.example.beelearning.entity.Assignment;
import org.example.beelearning.entity.Lesson;
import org.example.beelearning.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment,Integer> {
    List<Assignment> findByLessonId(Lesson assignmentId);

    Optional<Object> findByAssignmentId(Integer id);

    @Query("""
    select count(a)
    from Assignment a
    join a.lessonId l
    join l.course c
    where c.courseId = :cid
""")
    long countAssignmentsInCourse(@Param("cid") Integer courseId);
}


