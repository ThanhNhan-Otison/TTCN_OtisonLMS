package org.example.beelearning.repository;

import org.example.beelearning.entity.Assignment;
import org.example.beelearning.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission,Integer> {

    List<Submission> findByAssignmentId_AssignmentId(Integer assignmentId);
    List<Submission> findByStudentId_UserId(Integer userId);
    Optional<Submission> findByAssignmentId_AssignmentIdAndStudentId_UserId(Integer assignmentId, Integer studentId);
    @Query("select count(distinct s.studentId.userId) from Submission s where s.assignmentId.assignmentId = :aid")
    long countDistinctStudentsByAssignment(@Param("aid") Integer assignmentId);
    @Query("select count(s) from Submission s where s.assignmentId.assignmentId = :aid")
    long countTotalSubmissionsByAssignment(@Param("aid") Integer assignmentId);
    @Query("""
        select s from Submission s
        join s.assignmentId a
        join a.lessonId l
        join l.course c
        where c.teacher.userId = :teacherId
        order by s.submittedAt desc
    """)
    List<Submission> findAllByTeacher(@Param("teacherId") Integer teacherId);
    @Query("""
        select count(s) from Submission s
        join s.assignmentId a
        join a.lessonId l
        join l.course c
        where c.teacher.userId = :teacherId
    """)
    long countAllByTeacher(@Param("teacherId") Integer teacherId);
    @Query("""
        select count(distinct s.studentId.userId) from Submission s
        join s.assignmentId a
        join a.lessonId l
        join l.course c
        where c.teacher.userId = :teacherId
    """)
    long countDistinctStudentsByTeacher(@Param("teacherId") Integer teacherId);
    @Query("""
    select count(distinct s.assignmentId.assignmentId)
    from Submission s
    join s.assignmentId a
    join a.lessonId l
    join l.course c
    where c.courseId = :cid
      and s.studentId.userId = :uid
""")
    long countDistinctAssignmentsSubmittedInCourse(@Param("cid") Integer courseId,
                                                   @Param("uid") Integer userId);

    @Query("""
    select count(s)
    from Submission s
    join s.assignmentId a
    join a.lessonId l
    join l.course c
    where c.courseId = :cid
""")
    long countSubmissionsInCourse(@Param("cid") Integer courseId);
    @Query("""
    select count(distinct s.studentId.userId)
    from Submission s
    join s.assignmentId a
    join a.lessonId l
    join l.course c
    where c.courseId = :cid
""")
    long countDistinctStudentsSubmittedInCourse(@Param("cid") Integer courseId);
    @Query("""
    select avg(s.score)
    from Submission s
    join s.assignmentId a
    join a.lessonId l
    join l.course c
    where c.courseId = :cid
      and s.score is not null
""")
    Double avgScoreInCourse(@Param("cid") Integer courseId);
    @Query("""
    select s
    from Submission s
    join s.assignmentId a
    join a.lessonId l
    join l.course c
    where c.courseId = :cid
      and s.studentId.userId = :uid
    order by s.submittedAt desc
""")
    List<Submission> findMySubmissionsInCourse(@Param("cid") Integer courseId,
                                               @Param("uid") Integer userId);

}
