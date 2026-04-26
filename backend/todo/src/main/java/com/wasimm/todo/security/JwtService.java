package com.wasimm.todo.security;


import com.wasimm.todo.Entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
@Service
public class JwtService {

  //  private final String SECRET_KEY = "your-very-secret-key-change-this";

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    public String generateToken(User user) {

        String username = user.getEmail();
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", user.getRoles().stream().map(role -> role.getName()).toList())
                .claim("userId", user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hour
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY.getBytes())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean isTokenValid(String token, String username) {
        return extractUsername(token).equals(username);
    }
}
