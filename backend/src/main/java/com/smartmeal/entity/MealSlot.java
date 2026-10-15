package com.smartmeal.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "meal_slots")
public class MealSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32, columnDefinition = "VARCHAR(32)")
    private MealType category = MealType.TIFFIN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id")
    private Menu menu;

    @Column(nullable = false)
    private String slotName;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Integer capacity = 100;

    @Column(nullable = false)
    private boolean available = true;

    public MealSlot() {
    }

    public MealSlot(MealType category, String slotName, LocalTime startTime, LocalTime endTime, Integer capacity) {
        this(category, slotName, startTime, endTime, capacity, null);
    }

    public MealSlot(
            MealType category,
            String slotName,
            LocalTime startTime,
            LocalTime endTime,
            Integer capacity,
            Menu menu) {

        this.category = category;
        this.slotName = slotName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.capacity = capacity;
        this.available = true;
        this.menu = menu;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MealType getCategory() {
        return category;
    }

    public void setCategory(MealType category) {
        this.category = category;
    }

    public Menu getMenu() {
        return menu;
    }

    public void setMenu(Menu menu) {
        this.menu = menu;
    }

    public String getSlotName() {
        return slotName;
    }

    public void setSlotName(String slotName) {
        this.slotName = slotName;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
