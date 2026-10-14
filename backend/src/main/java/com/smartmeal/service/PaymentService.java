package com.smartmeal.service;

import com.smartmeal.dto.PaymentInitiateRequest;
import com.smartmeal.dto.PaymentProofRequest;
import com.smartmeal.entity.*;
import com.smartmeal.repository.OrderRepository;
import com.smartmeal.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    // Configurable canteen payment placeholders
    private final String canteenUpiId = "anuragcanteen@upi";
    private final String canteenPhone = "9876543210";
    private final String canteenPayeeName = "Anurag University Canteen";

    public PaymentService(PaymentRepository paymentRepository, OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public Map<String, Object> initiatePayment(User user, PaymentInitiateRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + request.getOrderId()));

        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new IllegalStateException("You are not authorized for this order");
        }

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("This order has already been paid for.");
        }

        Optional<Payment> existingOpt = paymentRepository.findByOrder(order);
        Payment payment = existingOpt.orElseGet(() -> {
            Payment p = new Payment();
            p.setOrder(order);
            p.setAmount(order.getTotalAmount());
            p.setStatus(PaymentStatus.PENDING);
            p.setCreatedAt(LocalDateTime.now());
            return p;
        });

        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.UPI_QR);
        payment = paymentRepository.save(payment);

        // Generate UPI intent URI
        // Example: upi://pay?pa=anuragcanteen@upi&pn=Anurag%20University%20Canteen&am=120.00&tr=SM-20261014-9421&cu=INR
        String upiIntent = String.format("upi://pay?pa=%s&pn=%s&am=%.2f&tr=%s&cu=INR",
                canteenUpiId, canteenPayeeName.replace(" ", "%20"), order.getTotalAmount(), order.getOrderNumber());

        Map<String, Object> details = new HashMap<>();
        details.put("paymentId", payment.getId());
        details.put("orderId", order.getId());
        details.put("orderNumber", order.getOrderNumber());
        details.put("amount", order.getTotalAmount());
        details.put("canteenUpiId", canteenUpiId);
        details.put("canteenPhone", canteenPhone);
        details.put("canteenPayeeName", canteenPayeeName);
        details.put("upiIntentUri", upiIntent);
        details.put("paymentMethod", payment.getPaymentMethod());
        details.put("status", payment.getStatus());
        details.put("isSandboxAvailable", true);

        return details;
    }

    @Transactional
    public Payment submitPaymentProof(Long paymentId, User user, PaymentProofRequest proof) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        Order order = payment.getOrder();
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new IllegalStateException("Unauthorized access to payment");
        }

        String ref = proof.getProviderReference() != null ? proof.getProviderReference().trim() : "UPI-TXN-" + System.currentTimeMillis();
        payment.setProviderReference(ref);
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        order.setPaymentReference(ref);
        order.setOrderStatus(OrderStatus.PAYMENT_VERIFICATION_PENDING);
        orderRepository.save(order);

        return payment;
    }

    @Transactional
    public Payment verifyPaymentByAdmin(Long paymentId, String adminEmail) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        Order order = payment.getOrder();
        payment.setStatus(PaymentStatus.PAID);
        payment.setVerifiedBy(adminEmail != null ? adminEmail : "Canteen Admin");
        payment.setVerifiedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        order.setPaymentStatus(PaymentStatus.PAID);
        order.setOrderStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        return payment;
    }

    @Transactional
    public Payment simulateSandboxPaymentSuccess(Long paymentId, User user) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        Order order = payment.getOrder();
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new IllegalStateException("Unauthorized access to payment");
        }

        String sandboxRef = "SANDBOX-UPI-" + (100000000000L + (long)(Math.random() * 899999999999L));
        payment.setProviderReference(sandboxRef);
        payment.setPaymentMethod(PaymentMethod.SANDBOX_DEMO);
        payment.setStatus(PaymentStatus.PAID);
        payment.setVerifiedBy("System Sandbox Gateway");
        payment.setVerifiedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        order.setPaymentReference(sandboxRef);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setOrderStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        return payment;
    }

    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    public Optional<Payment> getPaymentByOrderId(Long orderId) {
        return orderRepository.findById(orderId).flatMap(paymentRepository::findByOrder);
    }

    public List<Payment> getPendingPayments() {
        return paymentRepository.findByStatusOrderByCreatedAtDesc(PaymentStatus.PENDING);
    }
}
