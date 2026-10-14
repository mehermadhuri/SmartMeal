package com.smartmeal.service;

import com.smartmeal.entity.Booking;
import com.smartmeal.entity.BookingStatus;
import com.smartmeal.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public Booking saveBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getBookingsByDate(LocalDate date) {
        return bookingRepository.findByBookingDate(date);
    }

    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    public long countBookingsForMenu(Long menuId, BookingStatus status) {
        return bookingRepository.countByMenuIdAndStatus(menuId, status);
    }

    public long countBookingsForSlot(Long slotId, BookingStatus status) {
        return bookingRepository.countBySlotIdAndStatus(slotId, status);
    }
}
