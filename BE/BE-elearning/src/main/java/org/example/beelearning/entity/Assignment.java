package org.example.beelearning.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bai_tap")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_baitap")
    private Integer assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_bh", nullable = false)
    private Lesson lessonId;

    @Column(name = "tieu_de", nullable = false, length = 255)
    private String title;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String description;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "diem_toi_da")
    private Integer maxScore;

}
