package com.smartmeal.service;

import com.smartmeal.dto.OrderItemRequest;
import com.smartmeal.dto.OrderRequest;
import com.smartmeal.entity.*;
import com.smartmeal.repository.MenuRepository;
import com.smartmeal.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuRepository menuRepository;
    private final BookingWindowService bookingWindowService;
    private final SecureRandom random = new SecureRandom();

    public OrderService(
            OrderRepository orderRepository,
            MenuRepository menuRepository,
            BookingWindowService bookingWindowService) {
        this.orderRepository = orderRepository;
        this.menuRepository = menuRepository;
        this.bookingWindowService = bookingWindowService;
    }

    @Transactional
    public Order createOrder(User user, OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot place an empty order");
        }

        MealType category = request.getMealCategory() != null ? request.getMealCategory() : MealType.TIFFIN;

        // Duplicate order protection: reuse existing pending order from the last 10 minutes if identical
        List<Order> recentOrders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        for (Order recent : recentOrders) {
            if (recent.getOrderStatus() == OrderStatus.PENDING_PAYMENT
                    && recent.getPaymentStatus() == PaymentStatus.PENDING
                    && recent.getCreatedAt() != null
                    && recent.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(10))
                    && recent.getMealCategory() == category) {

                if (isSameOrderItems(recent.getItems(), request.getItems())) {
                    if (request.getPickupSlot() != null && !request.getPickupSlot().equals(recent.getPickupSlot())) {
                        recent.setPickupSlot(request.getPickupSlot());
                        return orderRepository.save(recent);
                    }
                    return recent;
                }
            }
        }

        Order order = new Order();
        order.setUser(user);
        order.setMealCategory(category);
        order.setPickupSlot(request.getPickupSlot() != null ? request.getPickupSlot() : "Counter Pickup");
        order.setOrderStatus(OrderStatus.PENDING_PAYMENT);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setOrderNumber(generateOrderNumber());

        BigDecimal calculatedSubtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                continue;
            }

            Menu menuItem = menuRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Menu item not found: " + itemReq.getMenuItemId()));

            if (!menuItem.isAvailable()) {
                throw new IllegalStateException("Item '" + menuItem.getName() + "' is currently sold out or unavailable.");
            }

            if (menuItem.getAvailableQuantity() < itemReq.getQuantity()) {
                throw new IllegalStateException("Not enough stock for '" + menuItem.getName() + "'. Available: " + menuItem.getAvailableQuantity());
            }

            // Decrement available stock
            menuItem.setAvailableQuantity(menuItem.getAvailableQuantity() - itemReq.getQuantity());
            if (menuItem.getAvailableQuantity() == 0) {
                menuItem.setAvailable(false);
            }
            menuRepository.save(menuItem);

            BigDecimal lineTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            calculatedSubtotal = calculatedSubtotal.add(lineTotal);

            OrderItem orderItem = new OrderItem(
                    order,
                    menuItem,
                    menuItem.getName(),
                    menuItem.getPrice(),
                    itemReq.getQuantity(),
                    lineTotal
            );

            order.getItems().add(orderItem);
        }

        if (order.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must have at least one valid item");
        }

        order.setSubtotal(calculatedSubtotal);
        order.setTotalAmount(calculatedSubtotal);

        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByOrderStatusOrderByCreatedAtDesc(status);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));
        order.setOrderStatus(newStatus);
        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Long orderId, User user, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new IllegalStateException("You are not authorized to cancel this order");
        }

        if (order.getOrderStatus() == OrderStatus.COLLECTED || order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order cannot be cancelled in status: " + order.getOrderStatus());
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(reason != null ? reason : "Cancelled by user");

        // Restore stock
        for (OrderItem item : order.getItems()) {
            if (item.getMenuItem() != null) {
                Menu menu = item.getMenuItem();
                menu.setAvailableQuantity(menu.getAvailableQuantity() + item.getQuantity());
                menu.setAvailable(true);
                menuRepository.save(menu);
            }
        }

        return orderRepository.save(order);
    }

    private boolean isSameOrderItems(List<OrderItem> existingItems, List<OrderItemRequest> requestedItems) {
        if (existingItems == null || requestedItems == null) return false;
        List<OrderItemRequest> validReq = requestedItems.stream()
                .filter(i -> i.getMenuItemId() != null && i.getQuantity() != null && i.getQuantity() > 0)
                .toList();
        if (existingItems.size() != validReq.size()) return false;

        for (OrderItemRequest req : validReq) {
            boolean matched = existingItems.stream().anyMatch(e ->
                    e.getMenuItem() != null
                            && e.getMenuItem().getId().equals(req.getMenuItemId())
                            && e.getQuantity().equals(req.getQuantity()));
            if (!matched) {
                return false;
            }
        }
        return true;
    }

    private String generateOrderNumber() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = 1000 + random.nextInt(9000);
        return "SM-" + datePrefix + "-" + rand;
    }
}
