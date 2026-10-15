package com.smartmeal.controller;

import com.smartmeal.entity.Notification;
import com.smartmeal.entity.Role;
import com.smartmeal.entity.User;
import com.smartmeal.service.NotificationService;
import com.smartmeal.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotifications(
            @PathVariable Long userId, Principal principal) {
        Optional<ResponseEntity<?>> accessFailure = checkUserAccess(userId, principal);
        if (accessFailure.isPresent()) {
            return accessFailure.get();
        }

        return ResponseEntity.ok(
                notificationService.getUserNotifications(userId)
        );
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<?> getUnreadNotifications(
            @PathVariable Long userId, Principal principal) {
        Optional<ResponseEntity<?>> accessFailure = checkUserAccess(userId, principal);
        if (accessFailure.isPresent()) {
            return accessFailure.get();
        }

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(userId)
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Notification> createNotification(
            @RequestBody Notification notification) {

        return ResponseEntity.ok(
                notificationService.saveNotification(notification)
        );
    }

    private Optional<ResponseEntity<?>> checkUserAccess(Long userId, Principal principal) {
        if (principal == null) {
            return Optional.of(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
        }
        User user = userService.findByEmail(principal.getName()).orElse(null);
        if (user == null) {
            return Optional.of(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
        }
        if (user.getRole() != Role.ADMIN && !user.getId().equals(userId)) {
            return Optional.of(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }
        return Optional.empty();
    }
}
