package org.example.beelearning.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="phieu_dang_ky_kh")
@Getter  @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment  {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "madk")
    private Integer id;
    @Column(name = "ngay_dk",nullable = false)
    private LocalDateTime registrationDate;
    @ManyToOne(fetch =FetchType.LAZY )
    @JoinColumn(name = "user_id",nullable = false)
    private User student; //sv dk
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name ="course_id",nullable = false)
    private Course course;
}
