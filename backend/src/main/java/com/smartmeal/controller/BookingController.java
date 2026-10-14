package com.smartmeal.controller;

import com.smartmeal.entity.Booking;
import com.smartmeal.entity.BookingStatus;
import com.smartmeal.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                bookingService.getBookingsByUserId(userId)
        );
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Booking>> getBookingsByDate(
            @PathVariable String date) {

        LocalDate bookingDate = LocalDate.parse(date);

        return ResponseEntity.ok(
                bookingService.getBookingsByDate(bookingDate)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByStatus(
            @PathVariable BookingStatus status) {

        return ResponseEntity.ok(
                bookingService.getBookingsByStatus(status)
        );
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestBody Booking booking) {

        booking.setStatus(BookingStatus.BOOKED);
        return ResponseEntity.ok(
                bookingService.saveBooking(booking)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {

        return ResponseEntity.notFound().build();
    }
}
