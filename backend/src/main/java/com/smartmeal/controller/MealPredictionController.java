package com.smartmeal.controller;

import com.smartmeal.entity.MealPrediction;
import com.smartmeal.entity.MealType;
import com.smartmeal.service.MealPredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/predictions")
public class MealPredictionController {

    private final MealPredictionService mealPredictionService;

    public MealPredictionController(MealPredictionService mealPredictionService) {
        this.mealPredictionService = mealPredictionService;
    }

    @GetMapping
    public ResponseEntity<List<MealPrediction>> getAllPredictions() {
        return ResponseEntity.ok(mealPredictionService.getAllPredictions());
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<MealPrediction>> getPredictionsByDate(@PathVariable String date) {
        LocalDate predictionDate = LocalDate.parse(date);
        return ResponseEntity.ok(mealPredictionService.getPredictionsByDate(predictionDate));
    }

    @GetMapping("/date/{date}/meal-type/{mealType}")
    public ResponseEntity<List<MealPrediction>> getPredictionsByDateAndMealType(
            @PathVariable String date,
            @PathVariable MealType mealType) {
        LocalDate predictionDate = LocalDate.parse(date);
        return ResponseEntity.ok(mealPredictionService.getPredictionsByDateAndMealType(predictionDate, mealType));
    }

    @PostMapping("/generate")
    public ResponseEntity<List<MealPrediction>> generatePredictions(@RequestParam(required = false) String date) {
        LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now().plusDays(1);
        return ResponseEntity.ok(mealPredictionService.generatePredictionsForDate(targetDate));
    }
}
