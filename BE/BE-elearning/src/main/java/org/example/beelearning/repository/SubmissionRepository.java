package org.example.beelearning.repository;

import org.example.beelearning.entity.Assignment;
import org.example.beelearning.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission,Integer> {

    // Sinh viên xem bài nộp của chính mình cho 1 bài tập
    List<Submission> findByAssignmentId_AssignmentId(Integer assignmentId);
    List<Submission> findByStudentId_UserId(Integer userId);
    Optional<Submission> findByAssignmentId_AssignmentIdAndStudentId_UserId(Integer assignmentId, Integer studentId);

    @Query("select count(distinct s.studentId.userId) from Submission s where s.assignmentId.assignmentId = :aid")
    long countDistinctStudentsByAssignment(@Param("aid") Integer assignmentId);
    @Query("select count(s) from Submission s where s.assignmentId.assignmentId = :aid")
    long countTotalSubmissionsByAssignment(@Param("aid") Integer assignmentId);
    // TEACHER xem tất cả bài nộp thuộc các course mình dạy
    @Query("""
        select s from Submission s
        join s.assignmentId a
        join a.lessonId l
        join l.course c
        where c.teacher.userId = :teacherId
        order by s.submittedAt desc
    """)
    List<Submission> findAllByTeacher(@Param("teacherId") Integer teacherId);

    // TEACHER: tổng số lượt nộp trong các khóa mình dạy
    @Query("""
        select count(s) from Submission s
        join s.assignmentId a
        join a.lessonId l
        join l.course c
        where c.teacher.userId = :teacherId
    """)
    long countAllByTeacher(@Param("teacherId") Integer teacherId);
    // TEACHER: số sinh viên DISTINCT đã nộp bài
    @Query("""
        select count(distinct s.studentId.userId) from Submission s
        join s.assignmentId a
        join a.lessonId l
        join l.course c
        where c.teacher.userId = :teacherId
    """)
    long countDistinctStudentsByTeacher(@Param("teacherId") Integer teacherId);
}
