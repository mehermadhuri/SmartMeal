package com.smartmeal.repository;

import com.smartmeal.entity.Booking;
import com.smartmeal.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByBookingDate(LocalDate bookingDate);

    List<Booking> findByStatus(BookingStatus status);

    long countByMenuIdAndStatus(Long menuId, BookingStatus status);

    long countBySlotIdAndStatus(Long slotId, BookingStatus status);
}
