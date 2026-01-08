package org.example.beelearning.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bai_hoc")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_bh")
    private Integer lessonId;

    @Column(name = "ten",nullable = false, length = 255)
    private String lessonName;

    @Column (name = "noi_dung",columnDefinition = "TEXT")
    private String content;

    @Column(name = "video_url",length = 500)
    private String videoUrl;

    // 🔥 FILE ĐÍNH KÈM
    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id",nullable = false)
    private Course course; //khoa hoc chua bai nay
}
