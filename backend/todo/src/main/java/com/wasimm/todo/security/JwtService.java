package com.wasimm.todo.security;

import com.wasimm.todo.Entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import java.util.Base64;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;

import javax.crypto.SecretKey;

@Service
public class JwtService {

    //  private final String SECRET_KEY = "your-very-secret-key-change-this";

    @Value("${jwt.secret}")
    private String SECRET_KEY;

//    private SecretKey SECRET_KEY;
//
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @PostConstruct
    public void init() {
        System.out.println("SECRET VALUE = ");

//        System.out.println("JWT Key length: " + SECRET_KEY.getEncoded().length);

    }

    public String generateToken(User user) {

        String username = user.getEmail();
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", user.getRoles().stream().map(role -> role.getName()).toList())
                .claim("userId", user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hour
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract Username
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // Validate Token
    public boolean isTokenValid(String token, String username) {
        return extractUsername(token).equals(username) && !isTokenExpired(token);
    }

    // Check Expiry
    public boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    // Common method to parse claims
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // FIXED.
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
