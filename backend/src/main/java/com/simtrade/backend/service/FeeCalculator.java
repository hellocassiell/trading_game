package com.simtrade.backend.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class FeeCalculator {

    // Calculate fee based on PRD
    public BigDecimal calculateTotalFee(BigDecimal transactionAmount, boolean isBuy, int lots) {
        // 1. 模拟经纪佣金：成交金额的 0.25%，最低收费 HK$100。
        BigDecimal commission = transactionAmount.multiply(new BigDecimal("0.0025")).setScale(2, RoundingMode.HALF_UP);
        if (commission.compareTo(new BigDecimal("100.00")) < 0) {
            commission = new BigDecimal("100.00");
        }

        // 2. 模拟交易处理费（仅买入收取）：每手 HK$2.5（最低 HK$30，最高 HK$200）。
        BigDecimal processingFee = BigDecimal.ZERO;
        if (isBuy) {
            processingFee = new BigDecimal("2.5").multiply(new BigDecimal(lots)).setScale(2, RoundingMode.HALF_UP);
            if (processingFee.compareTo(new BigDecimal("30.00")) < 0) {
                processingFee = new BigDecimal("30.00");
            } else if (processingFee.compareTo(new BigDecimal("200.00")) > 0) {
                processingFee = new BigDecimal("200.00");
            }
        }

        // 3. 模拟印花税：成交金额的 0.1%（最低收费 HK$1），通常印花税进位到整数，但这里按照普通计算
        BigDecimal stampDuty = transactionAmount.multiply(new BigDecimal("0.001")).setScale(2, RoundingMode.HALF_UP);
        if (stampDuty.compareTo(BigDecimal.ONE) < 0) {
            stampDuty = BigDecimal.ONE;
        }

        // 4. 模拟交易征费：成交金额的 0.003%
        BigDecimal tradingLevy = transactionAmount.multiply(new BigDecimal("0.00003")).setScale(2, RoundingMode.HALF_UP);

        // 5. 模拟交易费：成交金额的 0.005%
        BigDecimal tradingFee = transactionAmount.multiply(new BigDecimal("0.00005")).setScale(2, RoundingMode.HALF_UP);

        return commission.add(processingFee).add(stampDuty).add(tradingLevy).add(tradingFee);
    }
}