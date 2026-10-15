package com.smartmeal.controller;

import com.smartmeal.dto.ApiResponse;
import com.smartmeal.dto.PaymentInitiateRequest;
import com.smartmeal.dto.PaymentProofRequest;
import com.smartmeal.entity.Payment;
import com.smartmeal.entity.Role;
import com.smartmeal.entity.User;
import com.smartmeal.service.PaymentService;
import com.smartmeal.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserService userService;

    public PaymentController(PaymentService paymentService, UserService userService) {
        this.paymentService = paymentService;
        this.userService = userService;
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(Principal principal, @RequestBody PaymentInitiateRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Authentication required"));
        }
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Map<String, Object> details = paymentService.initiatePayment(user, request);
        return ResponseEntity.ok(details);
    }

    @PostMapping("/{id}/submit-proof")
    public ResponseEntity<?> submitProof(Principal principal, @PathVariable Long id, @RequestBody PaymentProofRequest proof) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Authentication required"));
        }
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Payment payment = paymentService.submitPaymentProof(id, user, proof);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/{id}/simulate-success")
    public ResponseEntity<?> simulateSandboxSuccess(Principal principal, @PathVariable Long id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Authentication required"));
        }
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Payment payment = paymentService.simulateSandboxPaymentSuccess(id, user);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/{id}/simulate-card")
    public ResponseEntity<?> simulateCardPayment(Principal principal, @PathVariable Long id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Authentication required"));
        }
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Payment payment = paymentService.simulateCardPayment(id, user);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/{id}/pay-at-canteen")
    public ResponseEntity<?> payAtCanteen(Principal principal, @PathVariable Long id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Authentication required"));
        }
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Payment payment = paymentService.recordPayAtCanteen(id, user);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<?> getPaymentStatus(Principal principal, @PathVariable Long id) {
        User user = authenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Authentication required"));
        }
        Optional<Payment> payment = paymentService.getPaymentById(id);
        if (payment.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        if (!canAccessPayment(user, payment.get())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(false, "You do not have permission to view this payment"));
        }
        return ResponseEntity.ok(payment.get());
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrderId(Principal principal, @PathVariable Long orderId) {
        User user = authenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Authentication required"));
        }
        Optional<Payment> payment = paymentService.getPaymentByOrderId(orderId);
        if (payment.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        if (!canAccessPayment(user, payment.get())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse(false, "You do not have permission to view this payment"));
        }
        return ResponseEntity.ok(payment.get());
    }

    private User authenticatedUser(Principal principal) {
        if (principal == null) {
            return null;
        }
        return userService.findByEmail(principal.getName()).orElse(null);
    }

    private boolean canAccessPayment(User user, Payment payment) {
        return user.getRole() == Role.ADMIN || payment.getOrder().getUser().getId().equals(user.getId());
    }
}
