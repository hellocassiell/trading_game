package com.simtrade.backend.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

public class AuthSendCodeRequest {

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^\\d{8}$", message = "请输入 8 位香港手机号")
    private String phone;

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
