package org.example.beelearning.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.example.beelearning.entity.User;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {


    private static final String SECRET =
            "CHANGE_ME_TO_A_LONG_RANDOM_SECRET_KEY_32+";

    private static final long EXP_MS = 7L * 24 * 60 * 60 * 1000;

    private final SecretKey key =
            Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public String generateToken(String email, String role, Integer userId) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + EXP_MS);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("userId", userId)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    public String generateToken(User u) {
        return generateToken(u.getEmail(), u.getRole().name(), u.getUserId());
    }
    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }
}

