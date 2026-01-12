package org.example.beelearning.repository;

import org.example.beelearning.entity.Lesson;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson,Integer> {

    List<Lesson> findByCourse_courseId(Integer courseId);
}
