package org.example.beelearning.repository;

import org.example.beelearning.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment,Integer> {
    boolean existsByStudent_UserIdAndCourse_CourseId(Integer userId, Integer courseId);
    List<Enrollment> findBystudent_userId(Integer userId);

    List<Enrollment> findBycourse_courseId(Integer courseCourseId);


}
