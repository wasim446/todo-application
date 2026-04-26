package com.wasimm.todo.dto;


import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class TodoRequest {

    private String title;
    private String description;
    private boolean completed;

    private LocalDateTime createdDate;

    // getters and setters
}