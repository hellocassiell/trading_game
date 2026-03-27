package com.simtrade.backend.service;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

public class FeeCalculatorTest {

    private FeeCalculator feeCalculator;

    @BeforeEach
    public void setUp() {
        feeCalculator = new FeeCalculator();
    }

    @Test
    public void testCalculateTotalFee_Buy_NormalAmount() {
        // Amount = 100,000 HKD, Lots = 20, isBuy = true
        // Commission: 100000 * 0.0025 = 250
        // Processing Fee: 20 * 2.5 = 50
        // Stamp Duty: 100000 * 0.001 = 100
        // Trading Levy: 100000 * 0.00003 = 3
        // Trading Fee: 100000 * 0.00005 = 5
        // Total = 408.00
        BigDecimal amount = new BigDecimal("100000.00");
        BigDecimal expectedFee = new BigDecimal("408.00");
        BigDecimal actualFee = feeCalculator.calculateTotalFee(amount, true, 20);
        Assertions.assertEquals(expectedFee, actualFee);
    }

    @Test
    public void testCalculateTotalFee_Sell_NormalAmount() {
        // Amount = 10,000 HKD, Lots = 2, isBuy = false
        // Commission: 10000 * 0.0025 = 25 -> 100 (min 100)
        // Processing Fee: 0 (not a buy)
        // Stamp Duty: 10000 * 0.001 = 10
        // Trading Levy: 10000 * 0.00003 = 0.30
        // Trading Fee: 10000 * 0.00005 = 0.50
        // Total = 110.80
        BigDecimal amount = new BigDecimal("10000.00");
        BigDecimal expectedFee = new BigDecimal("110.80");
        BigDecimal actualFee = feeCalculator.calculateTotalFee(amount, false, 2);
        Assertions.assertEquals(expectedFee, actualFee);
    }

    @Test
    public void testCalculateTotalFee_Buy_MinimumValues() {
        // Amount = 500 HKD, Lots = 1, isBuy = true
        // Commission: 500 * 0.0025 = 1.25 -> 100 (min 100)
        // Processing Fee: 1 * 2.5 = 2.5 -> 30 (min 30)
        // Stamp Duty: 500 * 0.001 = 0.50 -> 1 (min 1)
        // Trading Levy: 500 * 0.00003 = 0.02
        // Trading Fee: 500 * 0.00005 = 0.03
        // Total = 131.05
        BigDecimal amount = new BigDecimal("500.00");
        BigDecimal expectedFee = new BigDecimal("131.05");
        BigDecimal actualFee = feeCalculator.calculateTotalFee(amount, true, 1);
        Assertions.assertEquals(expectedFee, actualFee);
    }

    @Test
    public void testCalculateTotalFee_Buy_MaximumValues() {
        // Amount = 10,000,000 HKD, Lots = 1000, isBuy = true
        // Commission: 10000000 * 0.0025 = 25000
        // Processing Fee: 1000 * 2.5 = 2500 -> 200 (max 200)
        // Stamp Duty: 10000000 * 0.001 = 10000
        // Trading Levy: 10000000 * 0.00003 = 300
        // Trading Fee: 10000000 * 0.00005 = 500
        // Total = 36000.00
        BigDecimal amount = new BigDecimal("10000000.00");
        BigDecimal expectedFee = new BigDecimal("36000.00");
        BigDecimal actualFee = feeCalculator.calculateTotalFee(amount, true, 1000);
        Assertions.assertEquals(expectedFee, actualFee);
    }
}