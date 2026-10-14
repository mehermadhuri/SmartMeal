package com.smartmeal.service;

import com.smartmeal.entity.MealType;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class BookingWindowService {

    public static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    // Standard hours
    private LocalTime tiffinOpen = LocalTime.of(8, 0);
    private LocalTime tiffinClose = LocalTime.of(10, 0);

    private LocalTime lunchOpen = LocalTime.of(11, 30);
    private LocalTime lunchClose = LocalTime.of(14, 0);

    private LocalTime generalClose = LocalTime.of(15, 0);

    // Administrative test override (useful for live demonstrations and testing)
    private boolean testOverrideAllowed = false;

    public ZonedDateTime getCurrentTime() {
        return ZonedDateTime.now(IST_ZONE);
    }

    public boolean isTiffinBookingOpen() {
        if (testOverrideAllowed) return true;
        LocalTime now = getCurrentTime().toLocalTime();
        return !now.isBefore(tiffinOpen) && !now.isAfter(tiffinClose);
    }

    public boolean isLunchBookingOpen() {
        if (testOverrideAllowed) return true;
        LocalTime now = getCurrentTime().toLocalTime();
        return !now.isBefore(lunchOpen) && !now.isAfter(lunchClose);
    }

    public boolean isGeneralOrderingOpen() {
        if (testOverrideAllowed) return true;
        LocalTime now = getCurrentTime().toLocalTime();
        return now.isBefore(generalClose);
    }

    public boolean isCategoryOpen(MealType category) {
        if (testOverrideAllowed) return true;
        if (!isGeneralOrderingOpen()) return false;
        if (category == MealType.TIFFIN || category == MealType.BREAKFAST) {
            return isTiffinBookingOpen();
        } else if (category == MealType.LUNCH) {
            return isLunchBookingOpen();
        }
        return true;
    }

    public Map<String, Object> getWindowStatus() {
        LocalTime now = getCurrentTime().toLocalTime();
        Map<String, Object> status = new HashMap<>();
        status.put("currentTimeIST", now.toString());
        status.put("tiffinOpen", tiffinOpen.toString());
        status.put("tiffinClose", tiffinClose.toString());
        status.put("isTiffinOpen", isTiffinBookingOpen());

        status.put("lunchOpen", lunchOpen.toString());
        status.put("lunchClose", lunchClose.toString());
        status.put("isLunchOpen", isLunchBookingOpen());

        status.put("generalClose", generalClose.toString());
        status.put("isGeneralOrderingOpen", isGeneralOrderingOpen());
        status.put("testOverrideAllowed", testOverrideAllowed);
        return status;
    }

    public void setTestOverrideAllowed(boolean allow) {
        this.testOverrideAllowed = allow;
    }

    public boolean isTestOverrideAllowed() {
        return testOverrideAllowed;
    }

    public void updateTiffinHours(LocalTime open, LocalTime close) {
        this.tiffinOpen = open;
        this.tiffinClose = close;
    }

    public void updateLunchHours(LocalTime open, LocalTime close) {
        this.lunchOpen = open;
        this.lunchClose = close;
    }
}
