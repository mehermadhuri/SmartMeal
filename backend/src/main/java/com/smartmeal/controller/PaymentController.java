package com.smartmeal.controller;

import com.smartmeal.dto.ApiResponse;
import com.smartmeal.dto.PaymentInitiateRequest;
import com.smartmeal.dto.PaymentProofRequest;
import com.smartmeal.entity.Payment;
import com.smartmeal.entity.User;
import com.smartmeal.service.PaymentService;
import com.smartmeal.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<?> getPaymentStatus(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrderId(@PathVariable Long orderId) {
        return paymentService.getPaymentByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
