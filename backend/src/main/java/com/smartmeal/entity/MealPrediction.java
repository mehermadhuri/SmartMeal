package com.smartmeal.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "meal_predictions")
public class MealPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32, columnDefinition = "VARCHAR(32)")
    private MealType mealType;

    @Column(nullable = false)
    private String slot;

    @Column(nullable = false)
    private Integer predictedDemand;

    private Integer actualDemand;

    @Column(nullable = false)
    private Integer recommendedQuantity;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public MealPrediction() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.recommendedQuantity == null && this.predictedDemand != null) {
            this.recommendedQuantity = (int) Math.ceil(this.predictedDemand * 1.08); // +8% safety buffer
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public MealType getMealType() {
        return mealType;
    }

    public void setMealType(MealType mealType) {
        this.mealType = mealType;
    }

    public String getSlot() {
        return slot;
    }

    public void setSlot(String slot) {
        this.slot = slot;
    }

    public Integer getPredictedDemand() {
        return predictedDemand;
    }

    public void setPredictedDemand(Integer predictedDemand) {
        this.predictedDemand = predictedDemand;
    }

    public Integer getActualDemand() {
        return actualDemand;
    }

    public void setActualDemand(Integer actualDemand) {
        this.actualDemand = actualDemand;
    }

    public Integer getRecommendedQuantity() {
        return recommendedQuantity;
    }

    public void setRecommendedQuantity(Integer recommendedQuantity) {
        this.recommendedQuantity = recommendedQuantity;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
