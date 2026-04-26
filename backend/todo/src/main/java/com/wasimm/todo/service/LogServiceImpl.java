package com.wasimm.todo.service;

import com.wasimm.todo.Entity.SystemLog;
import com.wasimm.todo.repository.SystemLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;

@Service
public class LogServiceImpl implements LogService {

    private final SystemLogRepository logRepository;

    public LogServiceImpl(SystemLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public void saveLog(String module,
                        String action,
                        String performedBy,
                        Long targetId,
                        String status,
                        String message,
                        String ipAddress) {

        SystemLog log = new SystemLog();

        log.setTimestamp(LocalDateTime.now());
        log.setLevel("INFO");
        log.setModule(module);
        log.setAction(action);
        log.setPerformedBy(performedBy);
        log.setTargetId(targetId);
        log.setStatus(status);
        log.setMessage(message);
        log.setIpAddress(ipAddress);

        logRepository.save(log);
    }

    @Override
    public Page<SystemLog> getFilteredLogs(int page, int size, String module, String status, String fromDate, String toDate) {

        Specification<SystemLog> spec = (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // Module filter
            if (module != null && !module.isEmpty()) {
                predicates.add((Predicate) cb.equal(root.get("module"), module));
            }

            // Status filter
            if (status != null && !status.isEmpty()) {
                predicates.add((Predicate) cb.equal(root.get("status"), status));
            }

            // Date range filter
            if (fromDate != null && toDate != null &&
                    !fromDate.isEmpty() && !toDate.isEmpty()) {

                LocalDateTime start = LocalDate.parse(fromDate).atStartOfDay();
                LocalDateTime end = LocalDate.parse(toDate).atTime(23, 59, 59);

                predicates.add((Predicate) cb.between(root.get("timestamp"), start, end));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return logRepository.findAll(
                spec,
                PageRequest.of(page, size, Sort.by("timestamp").descending())
        );

    }
}
