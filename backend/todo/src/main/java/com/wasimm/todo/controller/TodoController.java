package com.wasimm.todo.controller;


import com.wasimm.todo.Entity.ToDo;
import com.wasimm.todo.Entity.User;
import com.wasimm.todo.annotation.AdminLog;
import com.wasimm.todo.dto.DeleteResponse;
import com.wasimm.todo.dto.TodoRequest;
import com.wasimm.todo.repository.UserRepository;
import com.wasimm.todo.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    @Autowired
    private final TodoService todoService;

    @Autowired
    private UserRepository userRepository;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @PostMapping(value = "/createTask")
    @AdminLog(module = "TASK", action = "CREATE")
    public ResponseEntity<ToDo> createTodo(
            @RequestBody TodoRequest request,
            Principal principal) {

        String username = principal.getName();

        ToDo todo = todoService.createTodo(request, username);
        return ResponseEntity.ok(todo);
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping(value = "/getTasks")
    public ResponseEntity<Page<ToDo>> getMyTodos(Principal principal, @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "6") int size,
                                                 @RequestParam(defaultValue = "createdDate") String sortBy,
                                                 @RequestParam(defaultValue = "desc") String direction) {

        String username = principal.getName();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() :
                Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ToDo> tasks = todoService.findByUser(user, pageable);

//        Page<ToDo> dtoPage = tasks.map(this::convertToDTO);

        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/taskCounts")
    public Map<String, Long> getCounts(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return todoService.getTaskCounts(user);
    }


    @PutMapping("/{id}")
    @AdminLog(module = "TASK", action = "UPDATE",  target="id")
    public ResponseEntity<ToDo> updateTodo(
            @PathVariable Long id,
            @RequestBody TodoRequest request,
            Principal principal) {

        String username = principal.getName();

        return ResponseEntity.ok(
                todoService.updateTodo(id, request, username)
        );
    }

    @DeleteMapping("/{id}")
    @AdminLog(module = "TASK", action = "DELETE",  target="id")
    public ResponseEntity<DeleteResponse> deleteTodo(
            @PathVariable Long id,
            Principal principal) {

        String username = principal.getName();

        todoService.deleteTodo(id, username);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new DeleteResponse(true, "Task deleted successfully"));
    }
}
