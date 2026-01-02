package org.example.beelearning.repository;


import org.example.beelearning.entity.User;
import org.example.beelearning.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    boolean existsByEmail(String email);

    //optional tránh null
    Optional<User> findByEmail(String email);

    Optional<User> findByResetToken(String resetToken);

    List<User> findByRole(Role role);
}
