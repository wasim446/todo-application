package com.wasimm.todo.service;

import com.wasimm.todo.Entity.SystemLog;
import org.springframework.data.domain.Page;

public interface LogService {

    public void saveLog(String module,
                        String action,
                        String performedBy,
                        Long targetId,
                        String status,
                        String message,
                        String ipAddress);

    Page<SystemLog> getFilteredLogs(int page, int size, String module, String status, String fromDate, String toDate);

}
