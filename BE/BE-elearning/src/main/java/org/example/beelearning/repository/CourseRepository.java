package org.example.beelearning.repository;

import org.example.beelearning.entity.Course;
import org.example.beelearning.entity.enums.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Integer> {

    // Dựa trên tên field trong User là userID
    List<Course> findByTeacher_userId(Integer userID);

    List<Course> findByStatus(CourseStatus status);

}
