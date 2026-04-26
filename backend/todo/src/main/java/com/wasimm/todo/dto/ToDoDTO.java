package com.wasimm.todo.dto;

import java.time.LocalDateTime;

public class ToDoDTO {

    private Long id;

    private String title;
    private String description;
    private boolean completed;

    private String createdBy;

    private LocalDateTime createdDate;

    public ToDoDTO(Long id, String title, String description, boolean completed, String createdBy, LocalDateTime createdDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.completed = completed;
        this.createdBy = createdBy;
        this.createdDate = createdDate;


    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public boolean isCompleted() {
        return completed;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
}
