package com.smartmeal.dto;

import com.smartmeal.entity.PaymentMethod;

public class PaymentInitiateRequest {

    private Long orderId;
    private PaymentMethod paymentMethod = PaymentMethod.UPI_QR;

    public PaymentInitiateRequest() {
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
