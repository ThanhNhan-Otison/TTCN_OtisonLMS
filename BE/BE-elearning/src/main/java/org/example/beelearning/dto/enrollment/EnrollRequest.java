package org.example.beelearning.dto.enrollment;

import lombok.Data;

@Data
public class EnrollRequest {
    private Integer studentId;
    private Integer courseId;
}
