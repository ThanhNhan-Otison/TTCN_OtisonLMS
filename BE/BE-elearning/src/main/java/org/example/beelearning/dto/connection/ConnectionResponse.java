package org.example.beelearning.dto.connection;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ConnectionResponse {
    private Long id;
    private Integer courseId;
    private String courseName;
    private String contactEmail;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Integer ownerId;
}

