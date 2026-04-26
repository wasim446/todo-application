package com.wasimm.todo.Entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Setter
@Getter
@Entity
@Table(name = "system_logs")
public class SystemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;

    private String level;

    private String module;

    private String action;

    private String performedBy;

    private Long targetId;

    private String status;

    private String message;

    private String ipAddress;
}
