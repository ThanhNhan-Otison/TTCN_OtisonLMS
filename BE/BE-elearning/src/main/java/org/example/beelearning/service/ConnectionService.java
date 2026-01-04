package org.example.beelearning.service;

import org.example.beelearning.dto.connection.ConnectionCreateRequest;
import org.example.beelearning.dto.connection.ConnectionResponse;

import java.util.List;

public interface ConnectionService {
    ConnectionResponse create(ConnectionCreateRequest req);

    // trả về các request ACTIVE chưa hết hạn
    List<ConnectionResponse> getActive();

    // chỉ xóa được request của chính mình
    void deleteMine(Long id);

    // optional: dọn EXPIRED (update status) khi load trang
    int cleanupExpired();
}

