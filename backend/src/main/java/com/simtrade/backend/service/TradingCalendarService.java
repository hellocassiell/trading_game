package com.simtrade.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

@Service
public class TradingCalendarService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final Set<LocalDate> holidays = Collections.synchronizedSet(new LinkedHashSet<LocalDate>());

    @Value("${trading.hk-holidays:}")
    public void setHolidayConfig(String holidayConfig) {
        synchronized (holidays) {
            holidays.clear();
            if (holidayConfig == null || holidayConfig.trim().isEmpty()) {
                return;
            }
            String[] values = holidayConfig.split(",");
            for (String value : values) {
                if (value == null) {
                    continue;
                }
                String trimmed = value.trim();
                if (trimmed.isEmpty()) {
                    continue;
                }
                holidays.add(LocalDate.parse(trimmed, DATE_FORMATTER));
            }
        }
    }

    public void replaceHolidays(Collection<LocalDate> dates) {
        synchronized (holidays) {
            holidays.clear();
            if (dates != null) {
                holidays.addAll(dates);
            }
        }
    }

    public boolean isTradingDay(LocalDate date) {
        if (date == null) {
            return false;
        }
        DayOfWeek day = date.getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            return false;
        }
        return !holidays.contains(date);
    }

    public LocalDate nextTradingDay(LocalDate fromDate) {
        LocalDate cursor = fromDate;
        while (!isTradingDay(cursor)) {
            cursor = cursor.plusDays(1);
        }
        return cursor;
    }

    public LocalDate addTradingDays(LocalDate fromDate, int days) {
        if (fromDate == null || days <= 0) {
            return fromDate;
        }
        LocalDate cursor = fromDate;
        int added = 0;
        while (added < days) {
            cursor = cursor.plusDays(1);
            if (isTradingDay(cursor)) {
                added++;
            }
        }
        return cursor;
    }
}

