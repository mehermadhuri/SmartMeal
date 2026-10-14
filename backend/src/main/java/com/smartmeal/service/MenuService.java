package com.smartmeal.service;

import com.smartmeal.dto.MenuRequest;
import com.smartmeal.entity.MealType;
import com.smartmeal.entity.Menu;
import com.smartmeal.repository.MenuRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MenuService {

    private final MenuRepository menuRepository;

    public MenuService(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    public List<Menu> getAllMenus() {
        return menuRepository.findAll();
    }

    public List<Menu> getAvailableMenus() {
        return menuRepository.findByAvailableTrue();
    }

    public List<Menu> getMenusByCategory(MealType category) {
        return menuRepository.findByMealType(category);
    }

    public List<Menu> getAvailableMenusByCategory(MealType category) {
        return menuRepository.findByMealTypeAndAvailableTrue(category);
    }

    public Optional<Menu> getMenuById(Long id) {
        return menuRepository.findById(id);
    }

    public Menu saveMenu(Menu menu) {
        return menuRepository.save(menu);
    }

    @Transactional
    public Menu createFromRequest(MenuRequest req) {
        Menu menu = new Menu();
        menu.setName(req.getName());
        menu.setDescription(req.getDescription());
        menu.setMealType(req.getMealType() != null ? req.getMealType() : MealType.TIFFIN);
        menu.setPrice(req.getPrice());
        menu.setImageUrl(req.getImageUrl());
        menu.setAvailableQuantity(req.getAvailableQuantity() != null ? req.getAvailableQuantity() : 50);
        menu.setBookingStart(req.getBookingStart());
        menu.setAvailable(req.isAvailable());
        menu.setDate(LocalDate.now());
        menu.setCreatedAt(LocalDateTime.now());
        return menuRepository.save(menu);
    }

    @Transactional
    public Menu updateFromRequest(Long id, MenuRequest req) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Menu item not found with id: " + id));

        if (req.getName() != null) menu.setName(req.getName());
        if (req.getDescription() != null) menu.setDescription(req.getDescription());
        if (req.getMealType() != null) menu.setMealType(req.getMealType());
        if (req.getPrice() != null) menu.setPrice(req.getPrice());
        if (req.getImageUrl() != null) menu.setImageUrl(req.getImageUrl());
        if (req.getAvailableQuantity() != null) menu.setAvailableQuantity(req.getAvailableQuantity());
        if (req.getBookingStart() != null) menu.setBookingStart(req.getBookingStart());
        menu.setAvailable(req.isAvailable());

        return menuRepository.save(menu);
    }

    @Transactional
    public Menu toggleAvailability(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Menu item not found with id: " + id));
        menu.setAvailable(!menu.isAvailable());
        return menuRepository.save(menu);
    }

    public void deleteMenu(Long id) {
        menuRepository.deleteById(id);
    }
}
