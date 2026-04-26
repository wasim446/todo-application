package com.wasimm.todo.dto;


public class DeleteResponse {

    private boolean success;
    private String message;

    public DeleteResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }
}

