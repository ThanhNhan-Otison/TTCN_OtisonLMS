package org.example.beelearning.repository;

import org.example.beelearning.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment,Integer> {
    boolean existsByStudent_UserIdAndCourse_CourseId(Integer userId, Integer courseId);
    List<Enrollment> findByStudent_UserId(Integer userId);

    List<Enrollment> findBycourse_courseId(Integer courseCourseId);

    @Query("""
        select count(e)
        from Enrollment e
        where e.course.courseId = :cid
    """)
    long countStudentsInCourse(@Param("cid") Integer courseId);

    // USER: các khóa đã đăng ký
//    List<Enrollment> findByStudent_UserId(Integer userId);

    // check đã đăng ký chưa
//    boolean existsByStudent_UserIdAndCourse_CourseId(
//            Integer userId,
//            Integer courseId
//    );

    // TEACHER / ADMIN
//    @Query("""
//        select count(e)
//        from Enrollment e
//        where e.course.courseId = :cid
//    """)
//    long countStudentsInCourse(@Param("cid") Integer courseId);
}
