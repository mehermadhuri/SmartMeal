package com.smartmeal.controller;

import com.smartmeal.dto.ApiResponse;
import com.smartmeal.dto.OrderRequest;
import com.smartmeal.entity.Order;
import com.smartmeal.entity.User;
import com.smartmeal.service.OrderService;
import com.smartmeal.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    public OrderController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(Principal principal, @RequestBody OrderRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "You must be logged in to place an order"));
        }

        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));

        Order order = orderService.createOrder(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Authentication required"));
        }

        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Order> orders = orderService.getOrdersByUser(user);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(Principal principal, @PathVariable Long id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Authentication required"));
        }

        Optional<Order> orderOpt = orderService.getOrderById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, "Order not found"));
        }

        Order order = orderOpt.get();
        // Allow student who owns the order or admin
        if (!order.getUser().getEmail().equals(principal.getName())) {
            User current = userService.findByEmail(principal.getName()).orElse(null);
            if (current == null || current.getRole() != com.smartmeal.entity.Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "You do not have permission to view this order"));
            }
        }

        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(Principal principal, @PathVariable Long id, @RequestParam(required = false) String reason) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Authentication required"));
        }

        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Order cancelled = orderService.cancelOrder(id, user, reason);
        return ResponseEntity.ok(cancelled);
    }
}
