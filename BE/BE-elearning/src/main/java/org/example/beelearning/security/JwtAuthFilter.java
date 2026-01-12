package org.example.beelearning.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.List;
import io.jsonwebtoken.Claims;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        String authHeader = request.getHeader("Authorization");
        System.out.println("[JWT] " + method + " " + path);
        System.out.println("[JWT] Authorization=" + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("[JWT] No Bearer token -> continue");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String email;
        try {
            email = jwtService.extractEmail(token);
            System.out.println("[JWT] email from token=" + email);
        } catch (Exception e) {
            System.out.println("[JWT] Token parse FAILED: " + e.getClass().getSimpleName() + " | " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            var userDetails = customUserDetailsService.loadUserByUsername(email);
            Claims claims = jwtService.parseClaims(token);
            String role = claims.get("role", String.class);
            String authority = (role != null && role.startsWith("ROLE_")) ? role : "ROLE_" + role;

            var authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    List.of(new SimpleGrantedAuthority(authority))
            );

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);

            System.out.println("[JWT] role=" + role + " -> authority=" + authority);
            System.out.println("[JWT] Authentication set OK");
        }
        filterChain.doFilter(request, response);
    }
}
