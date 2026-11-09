package com.example.taskmanager;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Security configuration for the Task Manager REST API.
 * - All /api/** endpoints are publicly accessible (no login required).
 * - CSRF is disabled (stateless REST API).
 * - CORS is configured to allow requests from the Vercel frontend.
 * - Session management is STATELESS (no server-side sessions).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disable CSRF – not needed for stateless REST APIs
            .csrf(csrf -> csrf.disable())

            // 2. Stateless session – no HttpSession, no cookies
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 3. Allow ALL requests without authentication
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )

            // 4. Apply CORS from corsConfigurationSource bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 5. Disable HTTP Basic auth popup (we don't want browser login dialogs)
            .httpBasic(basic -> basic.disable())

            // 6. Disable form login
            .formLogin(form -> form.disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allowed origins: Vercel frontend + local dev servers
        config.setAllowedOrigins(List.of(
            "https://smart-meal-nu.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:8081"
        ));

        // Allowed HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Allow all headers (Content-Type, Authorization, etc.)
        config.setAllowedHeaders(List.of("*"));

        // Expose headers to the browser
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));

        // We are NOT using cookies/credentials
        config.setAllowCredentials(false);

        // Cache preflight response for 1 hour
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
