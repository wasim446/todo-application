package com.wasimm.todo.service;

import com.wasimm.todo.Entity.Profile;
import com.wasimm.todo.dto.ProfileDTO;
import com.wasimm.todo.profile.mongo.ProfilePhoto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

public interface ProfilePhotoService {

    public String savePhoto(Long userId, MultipartFile file) throws IOException;

    public ProfileDTO getProfileByEmail(String email);

    public ProfilePhoto getPhoto(String id);

    public Optional<ProfilePhoto> findByUserId(Long id);

    public ResponseEntity<byte[]> getPhotoByEmail(String email);

    public Profile updateProfile(String email, ProfileDTO profile);

}
