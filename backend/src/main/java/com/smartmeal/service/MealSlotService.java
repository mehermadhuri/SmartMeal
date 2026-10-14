package com.smartmeal.service;

import com.smartmeal.entity.MealSlot;
import com.smartmeal.entity.MealType;
import com.smartmeal.repository.MealSlotRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MealSlotService {

    private final MealSlotRepository mealSlotRepository;

    public MealSlotService(MealSlotRepository mealSlotRepository) {
        this.mealSlotRepository = mealSlotRepository;
    }

    public List<MealSlot> getAllSlots() {
        return mealSlotRepository.findAll();
    }

    public List<MealSlot> getAvailableSlots() {
        return mealSlotRepository.findByAvailableTrue();
    }

    public List<MealSlot> getSlotsByCategory(MealType category) {
        return mealSlotRepository.findByCategoryAndAvailableTrue(category);
    }

    public Optional<MealSlot> getSlotById(Long id) {
        return mealSlotRepository.findById(id);
    }

    public MealSlot saveSlot(MealSlot slot) {
        return mealSlotRepository.save(slot);
    }

    public void deleteSlot(Long id) {
        mealSlotRepository.deleteById(id);
    }
}
