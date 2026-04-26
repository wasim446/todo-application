package com.wasimm.todo.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========== PERSONAL INFO ==========
    @Column(nullable = true)
    private String fullName;

    private LocalDate dateOfBirth;

    private String street;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private String phoneNumber;


    // ========== PROFESSIONAL INFO ==========
    private String title;

    private int experience;

    @Column(length = 2000)
    private String bio;

    @Column(length = 1000)
    private String skills; // comma separated

    // ========== PHOTO REFERENCE ==========
    private String photoId;

    // ========== RELATIONSHIP ==========
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

}

