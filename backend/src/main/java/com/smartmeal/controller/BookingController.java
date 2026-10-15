package com.smartmeal.controller;

import com.smartmeal.entity.Booking;
import com.smartmeal.entity.BookingStatus;
import com.smartmeal.entity.User;
import com.smartmeal.service.BookingService;
import com.smartmeal.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    public BookingController(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBookingsByUserId(
            @PathVariable Long userId, Principal principal) {
        User user = authenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (user.getRole() != com.smartmeal.entity.Role.ADMIN && !user.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(
                bookingService.getBookingsByUserId(userId)
        );
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getBookingsByDate(
            @PathVariable String date) {

        LocalDate bookingDate = LocalDate.parse(date);

        return ResponseEntity.ok(
                bookingService.getBookingsByDate(bookingDate)
        );
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getBookingsByStatus(
            @PathVariable BookingStatus status) {

        return ResponseEntity.ok(
                bookingService.getBookingsByStatus(status)
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> createBooking(
            @RequestBody Booking booking) {

        booking.setStatus(BookingStatus.BOOKED);
        return ResponseEntity.ok(
                bookingService.saveBooking(booking)
        );
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {

        return ResponseEntity.notFound().build();
    }

    private User authenticatedUser(Principal principal) {
        if (principal == null) {
            return null;
        }
        return userService.findByEmail(principal.getName()).orElse(null);
    }
}
