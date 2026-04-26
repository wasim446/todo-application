package com.wasimm.todo.dto;

import com.wasimm.todo.Entity.Role;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

public class UserDTO {


    private Long id;

    private String username;
    private String email;

    private Set<Role> roles = new HashSet<>();
    private LocalDateTime createdAt;

    public UserDTO(Long id, String username, String email, Set<Role> roles, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
