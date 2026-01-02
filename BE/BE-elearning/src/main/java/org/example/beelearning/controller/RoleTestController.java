package org.example.beelearning.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class RoleTestController {
    @GetMapping("/admin/hello")
    public String adminOnly() {
        return "Hello ADMIN";
    }

    @GetMapping("/teacher/hello")
    public String teacherOrAdmin() {
        return "Hello TEACHER or ADMIN";
    }

    @GetMapping("/student/hello")
    public String studentTeacherAdmin() {
        return "Hello USER / TEACHER / ADMIN";
    }
}
