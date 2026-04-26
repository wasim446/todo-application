package com.wasimm.todo.repository;


import com.wasimm.todo.profile.mongo.ProfilePhoto;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ProfilePhotoRepository
        extends MongoRepository<ProfilePhoto, String> {

    Optional<ProfilePhoto> findByUserId(Long userId);


}