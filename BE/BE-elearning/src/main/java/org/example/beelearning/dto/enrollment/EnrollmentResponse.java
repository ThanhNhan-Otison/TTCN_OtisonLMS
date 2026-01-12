package org.example.beelearning.dto.enrollment;

import lombok.Data;

@Data
public class EnrollmentResponse {
    private Integer enrollmentId;
    private Integer studentId;
    private String StudentName;
    private String studentEmail;
    private Integer courseId;
    private String CourseName;
    private String registeredAt;
}
