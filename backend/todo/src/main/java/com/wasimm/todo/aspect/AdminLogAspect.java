package com.wasimm.todo.aspect;

import com.wasimm.todo.annotation.AdminLog;
import com.wasimm.todo.service.LogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AdminLogAspect {

    private final LogService logService;

    public AdminLogAspect(LogService logService) {
        this.logService = logService;
    }

    @AfterReturning("@annotation(adminLog)")
    public void logSuccess(JoinPoint joinPoint, AdminLog adminLog) {

        String admin = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        // extract targetId
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();

        Long targetId = null;

        for (int i = 0; i < paramNames.length; i++) {
            if (paramNames[i].equals(adminLog.target())) {
                targetId = (Long) args[i];
            }
        }


        logService.saveLog(
                adminLog.module(),
                adminLog.action(),
                admin,
                targetId,
                "SUCCESS",
                "Action completed successfully",
                "SYSTEM"
        );
    }

    @AfterThrowing("@annotation(adminLog)")
    public void logFailure(JoinPoint joinPoint, AdminLog adminLog) {

        String admin = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        // extract targetId
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();

        Long targetId = null;

        for (int i = 0; i < paramNames.length; i++) {
            if (paramNames[i].equals(adminLog.target())) {
                targetId = (Long) args[i];
            }
        }

        logService.saveLog(
                adminLog.module(),
                adminLog.action(),
                admin,
                targetId,
                "FAILED",
                "Action failed",
                "SYSTEM"
        );
    }
}
