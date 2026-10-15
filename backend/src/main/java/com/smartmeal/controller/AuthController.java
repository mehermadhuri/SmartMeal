package com.smartmeal.controller;

import com.smartmeal.dto.ApiResponse;
import com.smartmeal.dto.LoginRequest;
import com.smartmeal.dto.LoginResponse;
import com.smartmeal.dto.RegisterRequest;
import com.smartmeal.dto.UserDto;
import com.smartmeal.entity.Role;
import com.smartmeal.entity.User;
import com.smartmeal.security.JwtService;
import com.smartmeal.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Full name is required"));
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Email address is required"));
        }

        if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Please provide a valid email address"));
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Password must contain at least 6 characters"));
        }

        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Passwords do not match"));
        }

        if (userService.existsByEmail(request.getEmail().trim().toLowerCase())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse(false, "Email address is already registered"));
        }

        String phone = (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty())
                ? request.getPhoneNumber().trim()
                : "N/A";

        String rollNumber;
        if (request.getRollNumber() != null && !request.getRollNumber().trim().isEmpty()) {
            rollNumber = request.getRollNumber().trim().toUpperCase();
            if (userService.existsByRollNumber(rollNumber)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ApiResponse(false, "Roll number is already registered"));
            }
        } else {
            rollNumber = "SM-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPhoneNumber(phone);
        user.setRollNumber(rollNumber);
        user.setDepartment(request.getDepartment() != null ? request.getDepartment().trim() : "CSE");
        user.setYear(request.getYear() != null ? request.getYear() : 1);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        user.setCreatedAt(LocalDateTime.now());

        userService.saveUser(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(true, "Registration successful! Please login with your credentials."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Email and password are required"));
        }

        Optional<User> userOptional = userService.findByEmail(request.getEmail().trim().toLowerCase());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid email or password"));
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid email or password"));
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        LoginResponse response = new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getRollNumber(),
                user.getPhoneNumber(),
                user.getDepartment(),
                user.getYear()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() != null && !"anonymousUser".equals(auth.getPrincipal())) {
                String email = (String) auth.getPrincipal();
                Optional<User> user = userService.findByEmail(email);
                if (user.isPresent()) {
                    return ResponseEntity.ok(UserDto.fromEntity(user.get()));
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Not authenticated"));
        }

        Optional<User> user = userService.findByEmail(principal.getName());
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(false, "User not found"));
        }

        return ResponseEntity.ok(UserDto.fromEntity(user.get()));
    }
}
