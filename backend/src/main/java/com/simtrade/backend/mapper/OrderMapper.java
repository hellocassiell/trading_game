package com.simtrade.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.simtrade.backend.entity.Order;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OrderMapper extends BaseMapper<Order> {
}