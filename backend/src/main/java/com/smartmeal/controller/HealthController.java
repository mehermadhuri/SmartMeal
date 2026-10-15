package com.smartmeal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataAccessException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private static final Logger logger = LoggerFactory.getLogger(HealthController.class);
    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "SmartMeal College Canteen Management Backend");
        status.put("version", "1.0.0");
        status.put("institution", "Anurag University, Hyderabad");
        status.put("timestamp", LocalDateTime.now().toString());
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            status.put("status", "UP");
            status.put("database", "UP");
            return ResponseEntity.ok(status);
        } catch (DataAccessException ex) {
            logger.warn("Health check could not reach the configured database", ex);
            status.put("status", "DOWN");
            status.put("database", "DOWN");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(status);
        }
    }
}
