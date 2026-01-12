package org.example.beelearning.controller;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.connection.ConnectionCreateRequest;
import org.example.beelearning.dto.connection.ConnectionResponse;
import org.example.beelearning.service.ConnectionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService connectionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER')")
    public ConnectionResponse create(@RequestBody ConnectionCreateRequest req) {
        return connectionService.create(req);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','STUDENT','TEACHER','ADMIN')")
    public List<ConnectionResponse> getActive() {
        return connectionService.getActive();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','STUDENT')")
    public void deleteMine(@PathVariable Long id) {
        connectionService.deleteMine(id);
    }
}

