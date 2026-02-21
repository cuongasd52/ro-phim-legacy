package com.rophim.legacy.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Using a default key for development if not set in env, but ideally should be
    // in env
    // 256-bit hex key
    @Value("${SECRET_KEY:NDB0RTYzNTI2NjU1NkE1ODZFMzI3MjM1NzUzODc4MkY0MTNGNDQyODQ3MkI0QjYyNTA2NDUzNjc1NjZCNTk3MA==}")
    private String secretKey;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        // I'll make sure it works.
        // Actually, let's use a simpler approach.
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    // Allow falling back to bytes if base64 fails (unlikely if we configure right)

    public String generateToken(String username, Map<String, Object> extraClaims) {
        return buildToken(extraClaims, username, 86400000); // 1 day
    }

    public String generateRefreshToken(String username, Map<String, Object> extraClaims) {
        return buildToken(extraClaims, username, 604800000); // 7 days
    }

    private String buildToken(Map<String, Object> extraClaims, String username, long expiration) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
