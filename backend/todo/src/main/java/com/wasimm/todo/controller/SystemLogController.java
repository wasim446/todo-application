package com.wasimm.todo.controller;

import com.wasimm.todo.Entity.SystemLog;
import com.wasimm.todo.repository.SystemLogRepository;
import com.wasimm.todo.service.LogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class SystemLogController {

    private final LogService systemLogRepository;

    public SystemLogController(LogService repository) {
        this.systemLogRepository = repository;
    }

    @GetMapping("/logs")
    public Page<SystemLog> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size, @RequestParam(required = false) String module,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {

        return systemLogRepository.getFilteredLogs(page, size, module, status, fromDate, toDate);
    }
}
