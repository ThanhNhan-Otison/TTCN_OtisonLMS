package org.example.beelearning.security;

import org.example.beelearning.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    private SecurityUtil() {
    }

    public static User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails customUserDetails)) {
            throw new RuntimeException("Invalid principal type");
        }

        return customUserDetails.getUser();
    }
}
