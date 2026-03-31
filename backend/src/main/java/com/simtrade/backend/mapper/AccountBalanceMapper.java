package com.simtrade.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.simtrade.backend.entity.AccountBalanceEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AccountBalanceMapper extends BaseMapper<AccountBalanceEntity> {
}
