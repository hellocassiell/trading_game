package com.simtrade.backend.service;

import com.simtrade.backend.dto.AuthSessionResponse;

public interface AuthService {

    void sendCode(String phone);

    AuthSessionResponse verifyCode(String phone, String code);
}
