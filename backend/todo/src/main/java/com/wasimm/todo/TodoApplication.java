package com.wasimm.todo;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Base64;

@SpringBootApplication
@EnableJpaAuditing
@EnableAspectJAutoProxy
public class TodoApplication {

    public static void main(String[] args) {
        SpringApplication.run(TodoApplication.class, args);
        System.out.println("ToDo Full stack application is running...");

//        var key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
//        String base64 = Base64.getEncoder().encodeToString(key.getEncoded());
//        System.out.println(base64);

    }

}
