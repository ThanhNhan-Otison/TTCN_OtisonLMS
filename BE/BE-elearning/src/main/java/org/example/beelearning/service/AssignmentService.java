package org.example.beelearning.service;

import org.example.beelearning.dto.assignment.AssignmentReqest;
import org.example.beelearning.dto.assignment.AssignmentResponse;
import org.example.beelearning.entity.Lesson;

import java.util.List;

public interface AssignmentService {
    AssignmentResponse  createAssignment(AssignmentReqest req);
    List<AssignmentResponse>  getAssignmentsBylessonId(Integer lessonId);

    List<AssignmentResponse> getAllAssignments();

    AssignmentResponse getAssignmentById(Integer id);
}
