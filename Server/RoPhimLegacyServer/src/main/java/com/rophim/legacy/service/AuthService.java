package com.rophim.legacy.service;

import com.rophim.legacy.exception.AuthException;
import com.rophim.legacy.models.User;
import com.rophim.legacy.repository.UserRepository;
import com.rophim.legacy.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new AuthException("User already exists");
        }
        user.setUserId(new ObjectId().toHexString());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        log.info("Login attempt for: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found: {}", email);

                    return new AuthException("Invalid email or password");
                });

        if (!passwordEncoder.matches(password, user.getPassword())) {
            log.error("Password mismatch for: {}", email);

            throw new AuthException("Invalid email or password");
        }

        try {
            log.info("Password matched. User fields: ID={}, First={}, Last={}, Role={}",
                    user.getUserId(), user.getFirstName(), user.getLastName(), user.getRole());

            // Generate tokens
            Map<String, Object> claims = new HashMap<>();
            claims.put("email", user.getEmail());
            claims.put("first_name", user.getFirstName());
            claims.put("last_name", user.getLastName());
            claims.put("uid", user.getUserId());
            claims.put("user_type", user.getRole());

            String accessToken = jwtUtil.generateToken(user.getEmail(), claims);
            String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), claims);

            user.setToken(accessToken);
            user.setRefreshToken(refreshToken);

            // Save tokens to DB as per Go implementation
            log.info("Login successful. Tokens generated and saved for: {}", email);
            userRepository.save(user);
            return user;
        } catch (Exception e) {
            log.error("Error during token generation or save", e);
            throw new RuntimeException("Login failed due to server error: " + e.getMessage());
        }
    }

    public User refreshToken(String refreshToken) {
        String email = jwtUtil.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("User not found"));

        if (!jwtUtil.isTokenValid(refreshToken, loadUserByUsername(email))) {
            throw new AuthException("Invalid refresh token");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("first_name", user.getFirstName());
        claims.put("last_name", user.getLastName());
        claims.put("uid", user.getUserId());
        claims.put("user_type", user.getRole());

        String newAccessToken = jwtUtil.generateToken(user.getEmail(), claims);
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail(), claims);

        user.setToken(newAccessToken);
        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);
        return user;
    }

    public void logout(String userId) {
        log.info("AUDIT - User ID {} has requested logout", userId);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
