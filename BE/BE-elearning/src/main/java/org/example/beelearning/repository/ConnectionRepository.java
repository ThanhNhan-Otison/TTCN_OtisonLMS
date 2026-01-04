package org.example.beelearning.repository;


import org.example.beelearning.entity.Connection;
import org.example.beelearning.entity.enums.ConnectSta;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    // lấy danh sách ACTIVE chưa hết hạn
    @Query("""
        select c from Connection c
        where c.status = :status
          and c.expiresAt > :now
        order by c.createdAt desc
    """)
    List<Connection> findActiveNotExpired(@Param("status") ConnectSta status,
                                          @Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    @Query("""
        update Connection c
        set c.status = :expired
        where c.status = :active
          and c.expiresAt <= :now
    """)
    int markExpired(@Param("active") ConnectSta active,
                    @Param("expired") ConnectSta expired,
                    @Param("now") LocalDateTime now);

    // chỉ xóa nếu đúng owner
    Optional<Connection> findByIdAndOwner_UserId(Long id, Integer ownerId);
}

