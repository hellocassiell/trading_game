package com.simtrade.backend.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class AuthProfileRequest {

    @NotBlank(message = "昵称不能为空")
    @Size(max = 20, message = "昵称长度不能超过 20")
    private String nickname;

    @NotBlank(message = "头像不能为空")
    @Size(max = 32, message = "头像标识长度不能超过 32")
    private String avatarId;

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getAvatarId() {
        return avatarId;
    }

    public void setAvatarId(String avatarId) {
        this.avatarId = avatarId;
    }
}
