package com.smartmeal.repository;

import com.smartmeal.entity.MealSlot;
import com.smartmeal.entity.MealType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealSlotRepository extends JpaRepository<MealSlot, Long> {

    List<MealSlot> findByMenuId(Long menuId);

    List<MealSlot> findByCategoryAndAvailableTrue(MealType category);

    List<MealSlot> findByAvailableTrue();
}
