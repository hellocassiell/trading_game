package com.simtrade.backend.dto;

public class AuthSessionResponse {
    private String userId;
    private String phone;
    private String token;

    public AuthSessionResponse() {}

    public AuthSessionResponse(String userId, String phone, String token) {
        this.userId = userId;
        this.phone = phone;
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
