package org.example.beelearning.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.beelearning.entity.enums.CourseStatus;

@Entity
@Table(name="khoa_hoc")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course extends BaseEntity{
    @Id @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="course_id")
    private Integer courseId;
    @Column(name = "ten",nullable = false, length = 255)
    private String name;
    @Column(name = "mo_ta",columnDefinition = "TEXT")
    private String description;
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai",length = 20)
    private CourseStatus status;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private User teacher;
}
