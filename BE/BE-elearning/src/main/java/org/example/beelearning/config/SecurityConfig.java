package org.example.beelearning.config;

import lombok.RequiredArgsConstructor;
import org.example.beelearning.repository.UserRepository;
import org.example.beelearning.security.CustomUserDetailsService;
import org.example.beelearning.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .userDetailsService(customUserDetailsService)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/v1/auth/login",
                                "/api/v1/auth/register",
                                "/api/v1/auth/forgot-password",
                                "/api/v1/auth/reset-password",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/docs/**",
                                "/videos/**",
                                "/submissions/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auth/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/auth/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/auth/change-password").authenticated()
                        .requestMatchers("/api/v1/teacher/**").hasAnyRole("TEACHER","ADMIN")
                        .requestMatchers("/api/v1/upload/**").hasAnyRole("TEACHER","ADMIN")
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/dashboard").hasRole("ADMIN")
                        .requestMatchers("/api/v1/student/**").hasAnyRole("USER", "TEACHER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/courses/enrolled").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/courses/mine").hasAnyRole("TEACHER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/courses/**", "/api/v1/lessons/**").hasAnyRole("TEACHER","ADMIN")
                        .requestMatchers(HttpMethod.PUT,  "/api/v1/courses/**", "/api/v1/lessons/**").hasAnyRole("TEACHER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE,"/api/v1/courses/**", "/api/v1/lessons/**").hasAnyRole("TEACHER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/courses/**", "/api/v1/lessons/**").permitAll()
                        .requestMatchers("/api/v1/submissions/**").authenticated()
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        http.httpBasic(b -> b.disable());
        http.formLogin(f -> f.disable());
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of(
                "http://127.0.0.1:5500",
                "http://localhost:5500"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With"
        ));
        config.setExposedHeaders(List.of("Authorization"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
