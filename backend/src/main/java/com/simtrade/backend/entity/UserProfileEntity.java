package com.simtrade.backend.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_user_profile")
public class UserProfileEntity {

    @TableId
    private String userId;

    private String phone;
    private String nickname;
    private String avatarId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
