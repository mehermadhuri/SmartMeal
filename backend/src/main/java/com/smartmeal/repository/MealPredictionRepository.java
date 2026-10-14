package com.smartmeal.repository;

import com.smartmeal.entity.MealPrediction;
import com.smartmeal.entity.MealType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MealPredictionRepository extends JpaRepository<MealPrediction, Long> {

    List<MealPrediction> findByDate(LocalDate date);

    List<MealPrediction> findByDateAndMealType(LocalDate date, MealType mealType);
}
