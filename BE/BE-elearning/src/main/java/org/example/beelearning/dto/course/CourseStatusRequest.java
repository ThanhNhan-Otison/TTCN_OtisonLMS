package org.example.beelearning.dto.course;

import org.example.beelearning.entity.enums.CourseStatus;

public class CourseStatusRequest {
    private CourseStatus status; // draft/publish/hidden

    public CourseStatus getStatus() {
        return status;
    }

    public void setStatus(CourseStatus status) {
        this.status = status;
    }
}
