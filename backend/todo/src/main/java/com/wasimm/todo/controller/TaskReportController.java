package com.wasimm.todo.controller;


import com.wasimm.todo.Entity.ToDo;
import com.wasimm.todo.Entity.User;
import com.wasimm.todo.repository.ToDoRepository;
import com.wasimm.todo.repository.UserRepository;
import com.wasimm.todo.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskReportController {

    @Autowired
    private final TodoService todoService;

    @Autowired
    private  UserRepository userRepository;
    private final ToDoRepository toDoRepository;

    @GetMapping("/report")
    public ResponseEntity<byte[]> downloadReport(Authentication authentication) throws Exception {


        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<ToDo> tasks = toDoRepository.findByUser(user);
        String userName = user.getUsername();
        byte[] pdf = todoService.generateTaskReport(tasks, userName);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=task-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
