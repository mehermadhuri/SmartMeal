package com.smartmeal.controller;

import com.smartmeal.entity.MealType;
import com.smartmeal.entity.Menu;
import com.smartmeal.service.MenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public ResponseEntity<List<Menu>> getAllMenus() {
        return ResponseEntity.ok(menuService.getAllMenus());
    }

    @GetMapping("/available")
    public ResponseEntity<List<Menu>> getAvailableMenus() {
        return ResponseEntity.ok(menuService.getAvailableMenus());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Menu>> getMenusByCategory(@PathVariable String category) {
        try {
            MealType mealType = MealType.valueOf(category.toUpperCase());
            return ResponseEntity.ok(menuService.getAvailableMenusByCategory(mealType));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Menu> getMenuById(@PathVariable Long id) {
        return menuService.getMenuById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
