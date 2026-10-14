package com.smartmeal.dto;

import com.smartmeal.entity.MealType;
import java.util.List;

public class OrderRequest {

    private MealType mealCategory;
    private String pickupSlot;
    private List<OrderItemRequest> items;

    public OrderRequest() {
    }

    public MealType getMealCategory() {
        return mealCategory;
    }

    public void setMealCategory(MealType mealCategory) {
        this.mealCategory = mealCategory;
    }

    public String getPickupSlot() {
        return pickupSlot;
    }

    public void setPickupSlot(String pickupSlot) {
        this.pickupSlot = pickupSlot;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
