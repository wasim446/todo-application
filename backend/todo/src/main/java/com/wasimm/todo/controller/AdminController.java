package com.wasimm.todo.controller;


import com.wasimm.todo.Entity.Role;
import com.wasimm.todo.Entity.ToDo;
import com.wasimm.todo.Entity.User;
import com.wasimm.todo.annotation.AdminLog;
import com.wasimm.todo.dto.ApiResponseDTO;
import com.wasimm.todo.dto.RoleUpdateRequest;
import com.wasimm.todo.dto.ToDoDTO;
import com.wasimm.todo.dto.UserDTO;
import com.wasimm.todo.repository.RoleRepository;
import com.wasimm.todo.repository.ToDoRepository;
import com.wasimm.todo.repository.UserRepository;
import com.wasimm.todo.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    TodoService todoService;

    @Autowired
    RoleRepository roleRepository;

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> userList = todoService.getMyAllUsers();
        return ResponseEntity.ok(userList);
    }

    @GetMapping("/tasks")
    public List<ToDoDTO> getAllTodos() {
        List<ToDoDTO> toDoList = todoService.getMyTodos();
        return toDoList;
    }

    @GetMapping("/recentUsers")
    public ResponseEntity<List<User>> getRecentUsers() {
        return ResponseEntity.ok(todoService.getRecentUsers());
    }

    @DeleteMapping("/users/{id}")
    @AdminLog(module = "USER", action = "DELETE", target="id")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        todoService.deleteUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully!");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/roles")
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @PutMapping("/users/{id}/role")
    @AdminLog(module = "ROLE", action = "UPDATE", target="id")
    public ResponseEntity<ApiResponseDTO> updateRole(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequest request) {

        todoService.updateUserRole(id, request.getRole());

        return ResponseEntity.ok(new ApiResponseDTO(true, "Role updated successfully"));
    }

}