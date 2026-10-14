package com.smartmeal.controller;

import com.smartmeal.dto.AdminDashboardResponse;
import com.smartmeal.dto.ApiResponse;
import com.smartmeal.dto.MenuRequest;
import com.smartmeal.dto.OrderStatusUpdateRequest;
import com.smartmeal.entity.*;
import com.smartmeal.repository.MenuRepository;
import com.smartmeal.repository.OrderRepository;
import com.smartmeal.service.BookingWindowService;
import com.smartmeal.service.MenuService;
import com.smartmeal.service.OrderService;
import com.smartmeal.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"})
public class AdminController {

    private final OrderRepository orderRepository;
    private final MenuRepository menuRepository;
    private final OrderService orderService;
    private final MenuService menuService;
    private final PaymentService paymentService;
    private final BookingWindowService bookingWindowService;

    public AdminController(
            OrderRepository orderRepository,
            MenuRepository menuRepository,
            OrderService orderService,
            MenuService menuService,
            PaymentService paymentService,
            BookingWindowService bookingWindowService) {
        this.orderRepository = orderRepository;
        this.menuRepository = menuRepository;
        this.orderService = orderService;
        this.menuService = menuService;
        this.paymentService = paymentService;
        this.bookingWindowService = bookingWindowService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboardStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        long totalOrdersToday = orderRepository.countOrdersSince(startOfDay);
        long totalPaidOrdersToday = orderRepository.countPaidOrdersSince(startOfDay);
        BigDecimal totalRevenueToday = orderRepository.totalRevenueSince(startOfDay);
        long pendingPayments = orderRepository.countPendingPayments();
        long activeMenuItems = menuRepository.findByAvailableTrue().size();

        return ResponseEntity.ok(new AdminDashboardResponse(
                totalOrdersToday,
                totalPaidOrdersToday,
                totalRevenueToday,
                pendingPayments,
                activeMenuItems
        ));
    }

    // Orders Management
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) PaymentStatus paymentStatus) {
        if (status != null) {
            return ResponseEntity.ok(orderService.getOrdersByStatus(status));
        }
        if (paymentStatus != null) {
            return ResponseEntity.ok(orderRepository.findByPaymentStatusOrderByCreatedAtDesc(paymentStatus));
        }
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.getStatus()));
    }

    // Payment Verification
    @PutMapping("/payments/{id}/verify")
    public ResponseEntity<Payment> verifyPayment(Principal principal, @PathVariable Long id) {
        String adminEmail = principal != null ? principal.getName() : "Canteen Admin";
        return ResponseEntity.ok(paymentService.verifyPaymentByAdmin(id, adminEmail));
    }

    @GetMapping("/payments/pending")
    public ResponseEntity<List<Payment>> getPendingPayments() {
        return ResponseEntity.ok(paymentService.getPendingPayments());
    }

    // Menu Management
    @PostMapping("/menus")
    public ResponseEntity<Menu> createMenu(@RequestBody MenuRequest request) {
        return ResponseEntity.ok(menuService.createFromRequest(request));
    }

    @PutMapping("/menus/{id}")
    public ResponseEntity<Menu> updateMenu(@PathVariable Long id, @RequestBody MenuRequest request) {
        return ResponseEntity.ok(menuService.updateFromRequest(id, request));
    }

    @PatchMapping("/menus/{id}/toggle")
    public ResponseEntity<Menu> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.toggleAvailability(id));
    }

    @DeleteMapping("/menus/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return ResponseEntity.noContent().build();
    }

    // Booking Window Control & Testing Override
    @PostMapping("/settings/override-hours")
    public ResponseEntity<ApiResponse> setTestOverride(@RequestParam boolean enable) {
        bookingWindowService.setTestOverrideAllowed(enable);
        return ResponseEntity.ok(new ApiResponse(true, "Booking hour test override is now: " + (enable ? "ENABLED (All hours allowed)" : "DISABLED (Normal hours enforced)")));
    }

    @GetMapping("/settings/window-status")
    public ResponseEntity<Map<String, Object>> getWindowStatus() {
        return ResponseEntity.ok(bookingWindowService.getWindowStatus());
    }
}
