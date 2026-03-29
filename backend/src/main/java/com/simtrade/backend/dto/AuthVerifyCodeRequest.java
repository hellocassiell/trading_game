package com.simtrade.backend.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

public class AuthVerifyCodeRequest {

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^\\d{8}$", message = "请输入 8 位香港手机号")
    private String phone;

    @NotBlank(message = "验证码不能为空")
    @Pattern(regexp = "^\\d{6}$", message = "请输入 6 位验证码")
    private String code;

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
