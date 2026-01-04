package org.example.beelearning.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.dto.connection.ConnectionCreateRequest;
import org.example.beelearning.dto.connection.ConnectionResponse;
import org.example.beelearning.entity.Connection;
import org.example.beelearning.entity.Course;
import org.example.beelearning.entity.User;
import org.example.beelearning.entity.enums.ConnectSta;
import org.example.beelearning.exception.BusinessException;
import org.example.beelearning.repository.ConnectionRepository;
import org.example.beelearning.repository.CourseRepository;
import org.example.beelearning.security.SecurityUtil;
import org.example.beelearning.service.ConnectionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ConnectionServiceImpl implements ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final CourseRepository courseRepository;

    private static final int EXPIRE_DAYS = 30;


    @Override
    public ConnectionResponse create(ConnectionCreateRequest req) {
        User me = SecurityUtil.getCurrentUser();
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy khóa học"));

        LocalDateTime now = LocalDateTime.now();

        Connection c = Connection.builder()
                .course(course)
                .owner(me)
                .contactEmail(req.getContactEmail())
                .note(req.getNote())
                .createdAt(now)
                .expiresAt(now.plusDays(EXPIRE_DAYS))
                .status(ConnectSta.ACTIVE)
                .build();

        return toResponse(connectionRepository.save(c));
    }


//    @Override
//    @Transactional(readOnly = true)
//    public List<ConnectionResponse> getActive() {
//        // lazy cleanup: mỗi lần load list thì dọn hết hạn
//        // (hoặc bạn gọi cleanupExpired() bằng scheduler)
//        connectionRepository.markExpired(LocalDateTime.now());
//
//        return connectionRepository.findActiveNotExpired(LocalDateTime.now())
//                .stream().map(this::toResponse).toList();
//    }
    @Override
    @Transactional
    public List<ConnectionResponse> getActive() {
        LocalDateTime now = LocalDateTime.now();

        // ✅ dọn hết hạn trước khi trả list
        connectionRepository.markExpired(ConnectSta.ACTIVE, ConnectSta.EXPIRED, now);

        return connectionRepository.findActiveNotExpired(ConnectSta.ACTIVE, now)
                .stream().map(this::toResponse).toList();
    }
    @Override
    public void deleteMine(Long id) {
        User me = SecurityUtil.getCurrentUser();

        Connection c = connectionRepository
                .findByIdAndOwner_UserId(id, me.getUserId())
                .orElseThrow(() -> new BusinessException("Bạn không có quyền xóa yêu cầu này"));

        c.setStatus(ConnectSta.DELETED);
        connectionRepository.save(c);
    }

    @Override
    public int cleanupExpired() {
        return connectionRepository.markExpired(
                ConnectSta.ACTIVE,
                ConnectSta.EXPIRED,
                LocalDateTime.now()
        );
    }


    private ConnectionResponse toResponse(Connection c) {
        return ConnectionResponse.builder()
                .id(c.getId())
                .courseId(c.getCourse().getCourseId())
                .courseName(c.getCourse().getName())
                .contactEmail(c.getContactEmail())
                .note(c.getNote())
                .createdAt(c.getCreatedAt())
                .expiresAt(c.getExpiresAt())
                .ownerId(c.getOwner().getUserId())
                .build();
    }
}

