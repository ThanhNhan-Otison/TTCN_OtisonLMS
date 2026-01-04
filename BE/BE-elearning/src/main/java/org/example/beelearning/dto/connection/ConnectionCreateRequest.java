package org.example.beelearning.dto.connection;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConnectionCreateRequest {
    private Integer courseId;
    private String contactEmail;
    private String note;
}

