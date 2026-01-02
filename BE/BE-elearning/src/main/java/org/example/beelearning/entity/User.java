package org.example.beelearning.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.beelearning.entity.enums.Role;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "TaiKhoan",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_taikhoan_email",columnNames = "email")
        })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "ten", length = 100)
    private String firstName;

    @Column(name = "email", nullable = false, length = 150)
    private String email;
    @Column(name = "mk", nullable = false)
    private String password;

    @Column(name = "trang_thai", nullable = false)
    private boolean status;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20, nullable = false)
    private Role role ;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expire_at")
    private LocalDateTime resetTokenExpireAt;


}
