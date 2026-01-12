package org.example.beelearning.service;

import org.example.beelearning.dto.connection.ConnectionCreateRequest;
import org.example.beelearning.dto.connection.ConnectionResponse;

import java.util.List;

public interface ConnectionService {
    ConnectionResponse create(ConnectionCreateRequest req);
    List<ConnectionResponse> getActive();
    void deleteMine(Long id);
    int cleanupExpired();
}

