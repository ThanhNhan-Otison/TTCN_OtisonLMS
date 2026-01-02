package org.example.beelearning.entity;
;
import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;

@Entity
@Table(name = "bai_nop")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_bainop")
    private Integer submissionId;
    // Nội dung bài nộp: có thể là text, link file, v.v.
    @Column(name = "noi_dung", columnDefinition = "TEXT")
    private String content;
    // Nếu sau này bạn muốn cho upload file bài nộp -> lưu link ở đây
    @Column(name = "file_url")
    private String fileUrl;
    @Column(name = "thoi_gian_nop")
    private LocalDateTime submittedAt;
    // Chấm điểm
    @Column(name = "diem")
    private Integer score;
    @Column(name = "nhan_xet", columnDefinition = "TEXT")
    private String feedback;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_baitap",nullable = false)
    private Assignment assignmentId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private User studentId;
}
