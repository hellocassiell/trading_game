package com.simtrade.backend.service;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Arrays;

class TradingCalendarServiceTest {

    @Test
    void addTradingDays_shouldSkipWeekendAndConfiguredHoliday() {
        TradingCalendarService calendarService = new TradingCalendarService();
        calendarService.replaceHolidays(Arrays.asList(LocalDate.of(2026, 3, 30)));

        LocalDate settlement = calendarService.addTradingDays(LocalDate.of(2026, 3, 27), 2);

        Assertions.assertEquals(LocalDate.of(2026, 4, 1), settlement);
    }

    @Test
    void nextTradingDay_shouldReturnSelfWhenAlreadyTradingDay() {
        TradingCalendarService calendarService = new TradingCalendarService();
        calendarService.replaceHolidays(Arrays.asList(LocalDate.of(2026, 4, 1)));

        LocalDate next = calendarService.nextTradingDay(LocalDate.of(2026, 3, 31));

        Assertions.assertEquals(LocalDate.of(2026, 3, 31), next);
    }
}

