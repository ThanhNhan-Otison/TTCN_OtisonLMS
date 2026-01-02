package org.example.beelearning.dto.submission;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class SubmissionRequest {
    private Integer assigmentId;
    private String content;
    private String fileUrl;
}
