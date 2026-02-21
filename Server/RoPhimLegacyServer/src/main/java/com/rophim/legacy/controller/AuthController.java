package com.rophim.legacy.controller;

import com.rophim.legacy.dtos.UserLogin;
import com.rophim.legacy.dtos.UserResponse;
import com.rophim.legacy.models.User;
import com.rophim.legacy.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody @Valid User user) {
        User registeredUser = authService.register(user);

        UserResponse userResponse = UserResponse.builder()
                .userId(registeredUser.getUserId())
                .firstName(registeredUser.getFirstName())
                .lastName(registeredUser.getLastName())
                .email(registeredUser.getEmail())
                .role(registeredUser.getRole())
                .favouriteGenres(registeredUser.getFavouriteGenres())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody @Valid UserLogin loginRequest,
            HttpServletResponse response) {
        User user = authService.login(loginRequest.getEmail(), loginRequest.getPassword());

        // setTokenCookies(response, user.getToken(), user.getRefreshToken());

        UserResponse userResponse = UserResponse.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .token(user.getToken())
                .refreshToken(user.getRefreshToken())
                .favouriteGenres(user.getFavouriteGenres())
                .build();

        return ResponseEntity.ok(userResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> requestBody) {

        String refreshToken = requestBody.get("refresh_token");

        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Refresh token is missing from request body"));
        }

        try {
            User user = authService.refreshToken(refreshToken);

            Map<String, String> tokens = new HashMap<>();
            tokens.put("token", user.getToken());
            tokens.put("refreshToken", user.getRefreshToken());

            return ResponseEntity.ok(tokens);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired refresh token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> request) {
        String userId = request.get("user_id");

        if (userId != null) {
            System.out.println("AUDIT - Logout request for user ID: " + userId);
            authService.logout(userId);
        } else {
            System.out.println("WARN - Logout request with NO user ID");
        }

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Hello, RoPhimLegacy");
    }
}
