package com.smartmeal.controller;

import com.smartmeal.entity.MealSlot;
import com.smartmeal.entity.MealType;
import com.smartmeal.service.BookingWindowService;
import com.smartmeal.service.MealSlotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
public class MealSlotController {

    private final MealSlotService mealSlotService;
    private final BookingWindowService bookingWindowService;

    public MealSlotController(MealSlotService mealSlotService, BookingWindowService bookingWindowService) {
        this.mealSlotService = mealSlotService;
        this.bookingWindowService = bookingWindowService;
    }

    @GetMapping
    public ResponseEntity<List<MealSlot>> getAllSlots() {
        return ResponseEntity.ok(mealSlotService.getAvailableSlots());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<MealSlot>> getSlotsByCategory(@PathVariable String category) {
        try {
            MealType mealType = MealType.valueOf(category.toUpperCase());
            return ResponseEntity.ok(mealSlotService.getSlotsByCategory(mealType));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/window-status")
    public ResponseEntity<Map<String, Object>> getWindowStatus() {
        return ResponseEntity.ok(bookingWindowService.getWindowStatus());
    }
}
