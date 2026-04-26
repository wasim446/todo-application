package com.wasimm.todo.controller;

import com.wasimm.todo.Entity.Profile;
import com.wasimm.todo.dto.ProfileDTO;
import com.wasimm.todo.profile.mongo.ProfilePhoto;
import com.wasimm.todo.security.CustomUserDetails;
import com.wasimm.todo.service.ProfilePhotoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.HashMap;

@RestController
@RequestMapping("/api/todos/profile")
@RequiredArgsConstructor
public class ProfilePhotoController {

    private final ProfilePhotoService profilePhotoService;

    @GetMapping
    public ResponseEntity<ProfileDTO> getProfile(Authentication authentication) {

        String email = authentication.getName();
        ProfileDTO profileDTO = profilePhotoService.getProfileByEmail(email);

        if (profileDTO == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(profileDTO);
    }

    @PutMapping("/updateProfile")
    public ResponseEntity<Profile> updateProfile(@Valid
                                                 @RequestBody ProfileDTO profileRequest,
                                                 Authentication authentication) {

        String email = authentication.getName();

        Profile updatedProfile = profilePhotoService.updateProfile(email, profileRequest);

        return ResponseEntity.ok(updatedProfile);
    }


    // upload photo
    @PostMapping("/uploadPhoto")
    public ResponseEntity<HashMap> uploadPhoto(
            @RequestParam("file") MultipartFile file, Authentication authentication)
            throws IOException {

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        Long userId = userDetails.getId();
        String photoId = profilePhotoService.savePhoto(userId, file);
        HashMap<String, String> photoMap = new HashMap<>();
        photoMap.put("photoId", photoId);

        return ResponseEntity.ok(photoMap);
    }


    @GetMapping("/photo")
    public ResponseEntity<byte[]> getPhoto(Authentication authentication) {

//        ProfilePhoto photo = profilePhotoService.findByUserId(userId)
//                .orElseThrow(() -> new RuntimeException("Photo not found"));

        String email = authentication.getName();   // extracted from JWT
        ResponseEntity<byte[]>  photo = profilePhotoService.getPhotoByEmail(email);

        return photo;
    }
}
