package org.example.beelearning.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.beelearning.entity.enums.ConnectSta;

import java.time.LocalDateTime;

@Entity
@Table(name = "ket_noi")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Connection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    @Column(name = "contact_email", nullable = false, length = 255)
    private String contactEmail;
    @Column(columnDefinition = "TEXT")
    private String note;
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConnectSta status;
}

