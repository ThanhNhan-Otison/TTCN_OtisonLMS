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

//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable())
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                .userDetailsService(customUserDetailsService)  // dùng service của bạn
//                .authorizeHttpRequests(auth -> auth
//                        // không cần đăng nhập
//                        .requestMatchers(
//                                "/api/v1/auth/login",
//                                "/api/v1/auth/register",
//                                "/swagger-ui/**",
//                                "/v3/api-docs/**",
//                                "/videos/**"
//                        ).permitAll()
//
//                        .requestMatchers("/api/v1/auth/me").authenticated()
//
//                        // chỉ ADMIN
//                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
//
//                        // TEACHER hoặc ADMIN
//                        .requestMatchers("/api/v1/teacher/**").hasAnyRole("TEACHER", "ADMIN")
//                        .requestMatchers("/api/v1/dashboard").hasAnyRole("TEACHER", "ADMIN")
//
//                        // USER/TEACHER/ADMIN đều được
//                        .requestMatchers("/api/v1/student/**").hasAnyRole("USER", "TEACHER", "ADMIN")
//
//                        // TẠM THỜI mở hết cho dễ test, khi OK rồi hãy siết lại
//                        //.anyRequest().permitAll()
//
//                        // tạo / sửa / xóa course & lesson
//                        .requestMatchers(HttpMethod.POST, "/api/v1/courses/**", "/api/v1/lessons/**")
//                        .hasAnyRole("TEACHER", "ADMIN")
//                        .requestMatchers(HttpMethod.PUT, "/api/v1/courses/**", "/api/v1/lessons/**")
//                        .hasAnyRole("TEACHER", "ADMIN")
//                        .requestMatchers(HttpMethod.DELETE, "/api/v1/courses/**", "/api/v1/lessons/**")
//                        .hasAnyRole("TEACHER", "ADMIN")
//
//                        // GET thì cho ai cũng xem (tùy bạn)
//                        .requestMatchers(HttpMethod.GET, "/api/v1/courses/**", "/api/v1/lessons/**")
//                        .permitAll()
//
//                        // còn lại: phải đăng nhập
//                        .anyRequest().authenticated()
//                )
//                // Tạm dùng Basic Auth để test quyền bằng Postman
//                .httpBasic(Customizer.withDefaults());
//
//        return http.build();
//    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .userDetailsService(customUserDetailsService)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .authorizeHttpRequests(auth -> auth
//
//                        // Public endpoints (không cần đăng nhập)
//                        .requestMatchers(
//                                "/api/v1/auth/login",
//                                "/api/v1/auth/register",
//                                "/swagger-ui/**",
//                                "/v3/api-docs/**",
//                                "/docs/**",
//                                "/videos/**",
//                                "/submissions/**"
//                        ).permitAll()
//                        .requestMatchers("/api/v1/teacher/**").hasAnyRole("TEACHER","ADMIN")
//                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//                        // Endpoint cần đăng nhập
//                        .requestMatchers("/api/v1/auth/me").authenticated()
//
//                        // ===== ✅ 2 endpoint mới (PHẢI để trước /api/v1/courses/** permitAll) =====
//                        // USER xem khóa học đã đăng ký (ADMIN cũng xem được nếu muốn)
//                        .requestMatchers(HttpMethod.GET, "/api/v1/courses/enrolled")
//                        .hasAnyRole("USER", "ADMIN")
//
//                        // TEACHER xem khóa học mình tạo (ADMIN cũng xem được nếu muốn)
//                        .requestMatchers(HttpMethod.GET, "/api/v1/courses/mine")
//                        .hasAnyRole("TEACHER", "ADMIN")
//                        .requestMatchers("/api/v1/upload/**").hasAnyRole("TEACHER", "ADMIN")
//                        // public
//                        .requestMatchers("/api/v1/auth/**").permitAll()
//                        // Chỉ ADMIN
//                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
//
//
//                        // TEACHER hoặc ADMIN
//                        .requestMatchers("/api/v1/teacher/**").hasAnyRole("TEACHER", "ADMIN")
//                        .requestMatchers("/api/v1/dashboard").hasAnyRole( "ADMIN")
//
//                        // USER/TEACHER/ADMIN đều được (nếu bạn dùng /student/** như khu vực chung)
//                        .requestMatchers("/api/v1/student/**").hasAnyRole("USER", "TEACHER", "ADMIN")
//
//                        // tạo / sửa / xóa course & lesson: TEACHER hoặc ADMIN
//                        .requestMatchers(HttpMethod.POST, "/api/v1/courses/**", "/api/v1/lessons/**")
//                        .hasAnyRole("TEACHER", "ADMIN")
//                        .requestMatchers(HttpMethod.PUT, "/api/v1/courses/**", "/api/v1/lessons/**")
//                        .hasAnyRole("TEACHER", "ADMIN")
//                        .requestMatchers(HttpMethod.DELETE, "/api/v1/courses/**", "/api/v1/lessons/**")
//                        .hasAnyRole("TEACHER", "ADMIN")
//
//                        //admin
//                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
//                        // GET thì cho ai cũng xem
//                        .requestMatchers(HttpMethod.GET, "/api/v1/courses/**", "/api/v1/lessons/**")
//                        .permitAll()
//
//                        .requestMatchers(
//                                "/api/v1/submissions/**"
//                        ).authenticated()
//
//                        // còn lại: phải đăng nhập
//                        .anyRequest().authenticated()
//                );
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public endpoints
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

                        // ✅ Authenticated endpoints (đặt rõ ràng)
                        .requestMatchers(HttpMethod.GET, "/api/v1/auth/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/auth/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/auth/change-password").authenticated()

                        // teacher/admin
                        .requestMatchers("/api/v1/teacher/**").hasAnyRole("TEACHER","ADMIN")
                        .requestMatchers("/api/v1/upload/**").hasAnyRole("TEACHER","ADMIN")

                        // admin
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/dashboard").hasRole("ADMIN")

                        // student area
                        .requestMatchers("/api/v1/student/**").hasAnyRole("USER", "TEACHER", "ADMIN")

                        // courses mine/enrolled (đặt trước GET permitAll)
                        .requestMatchers(HttpMethod.GET, "/api/v1/courses/enrolled").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/courses/mine").hasAnyRole("TEACHER","ADMIN")

                        // CRUD course/lesson
                        .requestMatchers(HttpMethod.POST, "/api/v1/courses/**", "/api/v1/lessons/**").hasAnyRole("TEACHER","ADMIN")
                        .requestMatchers(HttpMethod.PUT,  "/api/v1/courses/**", "/api/v1/lessons/**").hasAnyRole("TEACHER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE,"/api/v1/courses/**", "/api/v1/lessons/**").hasAnyRole("TEACHER","ADMIN")

                        // GET public
                        .requestMatchers(HttpMethod.GET, "/api/v1/courses/**", "/api/v1/lessons/**").permitAll()

                        // submissions: cần login
                        .requestMatchers("/api/v1/submissions/**").authenticated()

                        .anyRequest().authenticated()
                );

        // JWT filter
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

    // ✅ Cho phép FE gửi Authorization + JSON
    config.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With"
    ));

    // ✅ Nếu muốn FE đọc Authorization/headers trả về (thường không cần)
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
