package com.smartmeal.repository;

import com.smartmeal.entity.Order;
import com.smartmeal.entity.OrderStatus;
import com.smartmeal.entity.PaymentStatus;
import com.smartmeal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByUserOrderByCreatedAtDesc(User user);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByOrderStatusOrderByCreatedAtDesc(OrderStatus status);

    List<Order> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus status);

    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :since")
    long countOrdersSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.paymentStatus = 'PAID' AND o.createdAt >= :since")
    long countPaidOrdersSince(@Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = 'PAID' AND o.createdAt >= :since")
    java.math.BigDecimal totalRevenueSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.paymentStatus = 'PENDING' OR o.orderStatus = 'PAYMENT_VERIFICATION_PENDING'")
    long countPendingPayments();
}
