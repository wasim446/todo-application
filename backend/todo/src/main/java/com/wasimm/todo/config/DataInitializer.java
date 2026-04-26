package com.wasimm.todo.config;

import com.wasimm.todo.Entity.Role;
import com.wasimm.todo.Entity.User;
import com.wasimm.todo.repository.RoleRepository;
import com.wasimm.todo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(UserRepository userRepo,
                               RoleRepository roleRepo,
                               PasswordEncoder encoder) {

        return args -> {

            // 1️⃣ Create ROLE_USER if not exists
            Role userRole = roleRepo.findByName("ROLE_USER")
                    .orElseGet(() -> roleRepo.save(new Role("ROLE_USER")));

            // 2️⃣ Create ROLE_ADMIN if not exists
            Role adminRole = roleRepo.findByName("ROLE_ADMIN")
                    .orElseGet(() -> roleRepo.save(new Role("ROLE_ADMIN")));

            // 3️⃣ Create default admin user if not exists
            if (!userRepo.existsByEmail("admin1234@gmail.com")) {

                User admin = new User();
                admin.setEmail("admin1234@gmail.com");   // YES you define manually here
                admin.setPassword(encoder.encode("Admin@123"));
                admin.setUsername("Wasim Ahmad");
                admin.getRoles().add(adminRole);

                userRepo.save(admin);

                System.out.println("Default Admin Created!");
            }
        };
    }
}


