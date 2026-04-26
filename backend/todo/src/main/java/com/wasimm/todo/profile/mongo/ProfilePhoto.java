package com.wasimm.todo.profile.mongo;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Setter
@Getter
@Document(collection = "profile_photos")
public class ProfilePhoto {

    @Id
    private String id;

    private Long userId;       // reference to MySQL User
    private byte[] data;
    private String contentType;
    private String fileName;

    public ProfilePhoto() {
    }

    public ProfilePhoto(Long userId, byte[] data,
                        String contentType, String fileName) {
        this.userId = userId;
        this.data = data;
        this.contentType = contentType;
        this.fileName = fileName;
    }

    // getters & setters
}
