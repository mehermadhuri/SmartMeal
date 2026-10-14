package com.smartmeal.repository;

import com.smartmeal.entity.Menu;
import com.smartmeal.entity.MealType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, Long> {

    List<Menu> findByDate(LocalDate date);

    List<Menu> findByDateAndAvailableTrue(LocalDate date);

    List<Menu> findByMealType(MealType mealType);

    List<Menu> findByMealTypeAndAvailableTrue(MealType mealType);

    List<Menu> findByAvailableTrue();
}
