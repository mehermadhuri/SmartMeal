package com.smartmeal.entity;

public enum OrderStatus {
    PENDING_PAYMENT,
    PAYMENT_VERIFICATION_PENDING,
    CONFIRMED,
    PREPARING,
    READY_FOR_PICKUP,
    COLLECTED,
    CANCELLED
}
