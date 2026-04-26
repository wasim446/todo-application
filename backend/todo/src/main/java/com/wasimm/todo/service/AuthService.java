package com.wasimm.todo.service;


import com.wasimm.todo.Entity.Profile;
import com.wasimm.todo.Entity.Role;
import com.wasimm.todo.Entity.User;
import com.wasimm.todo.dto.RegisterRequest;
import com.wasimm.todo.exception.UserAlreadyExistsException;
import com.wasimm.todo.repository.ProfileRepository;
import com.wasimm.todo.repository.RoleRepository;
import com.wasimm.todo.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    ProfileRepository profileRepository;

    @Autowired
    RoleRepository roleRepository;

    @Transactional
    public void register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User already exists with this email");
        }

        User user = new User();
        user.setUsername(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow();

        user.getRoles().add(userRole);

        User savedUser =  userRepository.save(user);

        Profile profile = new Profile();
        profile.setUser(savedUser);

        profileRepository.save(profile);


    }
}

