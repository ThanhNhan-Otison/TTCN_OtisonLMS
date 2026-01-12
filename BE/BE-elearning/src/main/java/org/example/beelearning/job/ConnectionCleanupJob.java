package org.example.beelearning.job;



import lombok.RequiredArgsConstructor;
import org.example.beelearning.service.ConnectionService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ConnectionCleanupJob {

    private final ConnectionService connectionService;
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanup() {
        connectionService.cleanupExpired();
    }
}

