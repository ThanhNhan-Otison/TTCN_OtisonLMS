package org.example.beelearning.security;

import lombok.Getter;
import org.example.beelearning.entity.User;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class CustomUserDetails implements UserDetails {
    //user trong db
    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }
    public User getUser() {
        return user;
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Spring yêu cầu role có dạng ROLE_*
        String roleName = "ROLE_" + user.getRole().name();
        // ADMIN -> ROLE_ADMIN
        return List.of(new SimpleGrantedAuthority(roleName));

    }

    @Override
    public @Nullable String getPassword() {
        return user.getPassword(); // đã được mã hóa BCrypt
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // dùng email làm username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.isStatus();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.isStatus();
    }
}
