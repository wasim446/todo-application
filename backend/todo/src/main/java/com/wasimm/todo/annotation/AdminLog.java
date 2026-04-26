package com.wasimm.todo.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AdminLog {

    String module();   // USER, ROLE, AUTH
    String action();   // CREATE, UPDATE, DELETE
    String description() default "";
    String target() default ""; // field name
}
