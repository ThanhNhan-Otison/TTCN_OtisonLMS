package org.example.beelearning.repository;

import org.example.beelearning.entity.Lesson;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson,Integer> {
    //lay tat ca bai hoc cua 1 khoa
    List<Lesson> findByCourse_courseId(Integer courseId);
}
