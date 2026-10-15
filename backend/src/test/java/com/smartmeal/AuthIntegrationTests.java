package com.smartmeal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmeal.dto.LoginRequest;
import com.smartmeal.dto.RegisterRequest;
import com.smartmeal.entity.Role;
import com.smartmeal.entity.User;
import com.smartmeal.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class AuthIntegrationTests {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private String adminEmail;
    private String adminPassword;

    @BeforeEach
    public void setup() {
        adminEmail = "admin-" + UUID.randomUUID() + "@example.test";
        adminPassword = UUID.randomUUID().toString();

        User admin = new User();
        admin.setName("Integration Test Admin");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void testRegistrationAndLoginFlow() throws Exception {
        String testEmail = "student" + System.currentTimeMillis() + "@anurag.edu.in";
        String testRoll = "21H61A" + (System.currentTimeMillis() % 10000);

        RegisterRequest regReq = new RegisterRequest();
        regReq.setName("Anurag Student");
        regReq.setEmail(testEmail);
        regReq.setPhoneNumber("9876543210");
        regReq.setRollNumber(testRoll);
        regReq.setDepartment("CSE");
        regReq.setYear(4);
        regReq.setPassword("Secret@123");
        regReq.setConfirmPassword("Secret@123");

        // 1. Successful Registration
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));

        // Verify password is hashed, not plaintext
        Optional<User> savedUserOpt = userRepository.findByEmail(testEmail);
        assertTrue(savedUserOpt.isPresent());
        assertNotEquals("Secret@123", savedUserOpt.get().getPassword());
        assertTrue(savedUserOpt.get().getPassword().startsWith("$2a$") || savedUserOpt.get().getPassword().startsWith("$2b$"));

        // 2. Duplicate Registration Rejection
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));

        // 3. Login with valid credentials
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(testEmail);
        loginReq.setPassword("Secret@123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String studentToken = objectMapper.readTree(responseBody).get("token").asText();
        assertNotNull(studentToken);

        Long studentId = savedUserOpt.get().getId();
        mockMvc.perform(get("/api/notifications/user/" + studentId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications/user/" + (studentId + 100000))
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/bookings/date/2026-10-15")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        // 4. Login with invalid credentials
        LoginRequest badLogin = new LoginRequest();
        badLogin.setEmail(testEmail);
        badLogin.setPassword("WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized());

        // 5. Protected Endpoint Access without token fails
        mockMvc.perform(get("/api/orders/my"))
                .andExpect(status().isUnauthorized());

        // 6. Student cannot access Admin API (403 Forbidden)
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        // 7. Admin login and dashboard access
        LoginRequest adminLogin = new LoginRequest();
        adminLogin.setEmail(adminEmail);
        adminLogin.setPassword(adminPassword);

        MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String adminToken = objectMapper.readTree(adminResult.getResponse().getContentAsString()).get("token").asText();

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalOrdersToday").isNumber());
    }

    @Test
    void testRegistrationAndLoginWithEmailAndPasswordOnly() throws Exception {
        String email = "simple-" + UUID.randomUUID() + "@example.test";
        String password = "SimplePass123";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("email", email, "password", password))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));

        User registeredUser = userRepository.findByEmail(email).orElseThrow();
        assertEquals(email.substring(0, email.indexOf('@')), registeredUser.getName());
        assertNotEquals(password, registeredUser.getPassword());
        assertTrue(passwordEncoder.matches(password, registeredUser.getPassword()));

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }
}
