package org.example.beelearning.dto.submission;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.example.beelearning.entity.Assignment;
import org.example.beelearning.entity.Course;
import org.example.beelearning.entity.Lesson;
import org.example.beelearning.entity.Submission;

import java.time.LocalDateTime;

//@Getter
//@Setter
//@Builder
//public class SubmissionResponse {
//    private Integer submissionId;
//    private Integer assignmentId;
//    private Integer studentId;
//    private String content;
//    private String fileUrl;
//    private String description;
//    private LocalDateTime submittedAt;
//    private Integer score;
//    private String feedback;
//    public static SubmissionResponse fromEntity(Submission s) {
//        if (s == null) return null;
//
//        return SubmissionResponse.builder()
//                .submissionId(s.getSubmissionId())
//                .assignmentId(s.getAssignmentId() != null ? s.getAssignmentId().getAssignmentId() : null)
//                .studentId(s.getStudentId() != null ? s.getStudentId().getUserId() : null) // nếu User PK là userId thì đổi getId() -> getUserId()
//                .content(s.getContent())
//                .fileUrl(s.getFileUrl())
//                .submittedAt(s.getSubmittedAt())
//                .score(s.getScore())
//                .feedback(s.getFeedback())
//                .build();
//    }
//
//}
@Builder
@Getter
@Setter
public class SubmissionResponse {


    private Integer submissionId;

    // submission basic
    private Integer assignmentId;
    private Integer studentId;
    private String content;
    private String fileUrl;
    private LocalDateTime submittedAt;
    private Integer score;
    private String feedback;

    // ✅ thêm để FE hiển thị đẹp: tên bài tập / bài học / khóa học
    private String assignmentTitle;

    private Integer lessonId;
    private String lessonName;

    private Integer courseId;
    private String courseName;

    public static SubmissionResponse fromEntity(Submission s) {
        if (s == null) return null;

        // Submission -> Assignment
        Assignment a = s.getAssignmentId();

        // ✅ Assignment -> Lesson (theo naming của bạn: lessonId)
        Lesson l = (a != null) ? a.getLessonId() : null;

        // ✅ Lesson -> Course (theo naming của bạn: courseId)
        Course c = (l != null) ? l.getCourse() : null;

        return SubmissionResponse.builder()
                .submissionId(s.getSubmissionId())

                .assignmentId(a != null ? a.getAssignmentId() : null)
                .assignmentTitle(a != null ? a.getTitle() : null)

                .lessonId(l != null ? l.getLessonId() : null)
                .lessonName(l != null ? l.getLessonName() : null)

                .courseId(c != null ? c.getCourseId() : null)


                .courseName(c != null ? c.getName() : null)     // dùng nếu Course có field name

                .studentId(s.getStudentId() != null ? s.getStudentId().getUserId() : null)

                .content(s.getContent())
                .fileUrl(s.getFileUrl())
                .submittedAt(s.getSubmittedAt())
                .score(s.getScore())
                .feedback(s.getFeedback())
                .build();
    }
}

