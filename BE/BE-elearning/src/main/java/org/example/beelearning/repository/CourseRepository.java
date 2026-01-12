package org.example.beelearning.repository;

import org.example.beelearning.entity.Course;
import org.example.beelearning.entity.enums.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Integer> {

    // Dựa trên tên field trong User là userID
    List<Course> findByTeacher_userId(Integer userID);

    List<Course> findByStatus(CourseStatus status);
    @Query("""
        select c from Course c
        where c.teacher.userId = :tid
    """)
    List<Course> findAllByTeacherId(@Param("tid") Integer teacherId);
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
    select count(e)
    from Enrollment e
    where e.course.courseId = :cid
""")
    long countStudentsInCourse(@Param("cid") Integer courseId);

    // TEACHER: lấy các khóa mình dạy
//    List<Course> findByTeacher_UserId(Integer userId);

    // PUBLIC / ADMIN
//    List<Course> findByStatus(CourseStatus status);

//    @Query("""
//        select c
//        from Course c
//        where c.teacher.userId = :tid
//    """)
//    List<Course> findAllByTeacherId(@Param("tid") Integer teacherId);
}
