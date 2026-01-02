package org.example.beelearning.dto.course;

import lombok.Data;
import org.example.beelearning.entity.enums.CourseStatus;

@Data
public class CourseRequest {
    private String name;
    private String description;
    private CourseStatus status;
//    private Integer teacherId;
}
