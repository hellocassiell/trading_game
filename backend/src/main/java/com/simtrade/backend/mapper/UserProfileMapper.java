package com.simtrade.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.simtrade.backend.entity.UserProfileEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserProfileMapper extends BaseMapper<UserProfileEntity> {
}
