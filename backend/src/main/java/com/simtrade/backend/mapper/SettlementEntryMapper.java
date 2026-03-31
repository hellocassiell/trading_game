package com.simtrade.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.simtrade.backend.entity.SettlementEntryEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SettlementEntryMapper extends BaseMapper<SettlementEntryEntity> {
}
