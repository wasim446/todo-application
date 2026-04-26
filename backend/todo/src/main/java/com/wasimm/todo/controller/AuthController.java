package com.wasimm.todo.controller;


import com.wasimm.todo.Entity.User;
import com.wasimm.todo.dto.AuthRequest;
import com.wasimm.todo.dto.AuthResponse;
import com.wasimm.todo.dto.RegisterRequest;
import com.wasimm.todo.repository.UserRepository;
import com.wasimm.todo.security.JwtService;
import com.wasimm.todo.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    @Autowired
    private final AuthService authService;

    @Autowired
    UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService, AuthService authService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtService.generateToken(user);

        Set<String> roles = user.getRoles()
                .stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());

        AuthResponse authResponse = new AuthResponse(
                user.getEmail(),
                user.getUsername(),
                token,
                roles
        );
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<Map> register(@Valid
                                        @RequestBody RegisterRequest request) {

        authService.register(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User Registered Successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}
