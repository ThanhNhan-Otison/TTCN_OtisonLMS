package org.example.beelearning.controller;

import org.example.beelearning.entity.User;
import org.example.beelearning.entity.enums.Role;
import org.example.beelearning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Lấy danh sách user
//    @GetMapping
//    public List<User> getAllUsers() {
//        return userRepository.findAll();
//    }
    @GetMapping
    public List<User> getAll(@RequestParam(required = false) String role) {
        if (role == null || role.isBlank()) return userRepository.findAll();
        return userRepository.findByRole(Role.valueOf(role.toUpperCase()));
    }

    // true = hiện, false = ẩn
//    @PatchMapping("/{id}/status")
//    public User updateStatus(
//            @PathVariable Integer id,
//            @RequestBody Map<String, Boolean> body
//    ) {
//        Boolean status = body.get("status");
//        if (status == null) {
//            throw new RuntimeException("Missing status");
//        }
//
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        user.setStatus(status);
//        return userRepository.save(user);
//    }

    @PatchMapping("/{id}/status")
    public User setStatus(@PathVariable Integer id, @RequestBody Map<String, Boolean> body) {
        Boolean status = body.get("status");
        if (status == null) throw new RuntimeException("Missing status");

        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        u.setStatus(status); // true=hiện, false=ẩn
        return userRepository.save(u);
    }

}

