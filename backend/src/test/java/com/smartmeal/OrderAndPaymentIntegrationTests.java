package com.smartmeal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmeal.dto.LoginRequest;
import com.smartmeal.dto.OrderItemRequest;
import com.smartmeal.dto.OrderRequest;
import com.smartmeal.dto.PaymentInitiateRequest;
import com.smartmeal.dto.RegisterRequest;
import com.smartmeal.entity.MealType;
import com.smartmeal.entity.Menu;
import com.smartmeal.entity.Role;
import com.smartmeal.entity.User;
import com.smartmeal.repository.MenuRepository;
import com.smartmeal.repository.UserRepository;
import com.smartmeal.security.JwtService;
import com.smartmeal.service.BookingWindowService;
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

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class OrderAndPaymentIntegrationTests {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private BookingWindowService bookingWindowService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String studentToken;
    private Menu testItem;

    @BeforeEach
    public void setup() throws Exception {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Enable test override on booking hours so tests pass regardless of execution time
        bookingWindowService.setTestOverrideAllowed(true);

        String testEmail = "orders-" + UUID.randomUUID() + "@example.test";
        String testPassword = UUID.randomUUID().toString();
        RegisterRequest registration = new RegisterRequest();
        registration.setName("Order Integration Test");
        registration.setEmail(testEmail);
        registration.setPassword(testPassword);
        registration.setConfirmPassword(testPassword);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registration)))
                .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest();
        login.setEmail(testEmail);
        login.setPassword(testPassword);

        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        studentToken = objectMapper.readTree(res.getResponse().getContentAsString()).get("token").asText();

        // Pick an available menu item
        List<Menu> menus = menuRepository.findByAvailableTrue();
        assertFalse(menus.isEmpty(), "Database should have seeded menu items");
        testItem = menus.get(0);
    }

    @Test
    void testPublicHealthAndMenus() throws Exception {
        // 1. Health check
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database").value("UP"))
                .andExpect(jsonPath("$.service").isString());

        // 2. Public available menus
        mockMvc.perform(get("/api/menus/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // 3. Public meal slots
        mockMvc.perform(get("/api/slots"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testOrderCreationAndPaymentFlows() throws Exception {
        // 1. Place an order
        OrderRequest orderReq = new OrderRequest();
        orderReq.setMealCategory(testItem.getMealType() != null ? testItem.getMealType() : MealType.TIFFIN);
        orderReq.setPickupSlot("08:00 AM - 09:00 AM");

        OrderItemRequest itemReq = new OrderItemRequest();
        itemReq.setMenuItemId(testItem.getId());
        itemReq.setQuantity(2);
        orderReq.setItems(List.of(itemReq));

        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.orderStatus").value("PENDING_PAYMENT"))
                .andExpect(jsonPath("$.paymentStatus").value("PENDING"))
                .andReturn();

        long orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).get("id").asLong();

        // 2. Duplicate order protection: submitting the same request reuses the pending order
        MvcResult dupRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();

        long dupOrderId = objectMapper.readTree(dupRes.getResponse().getContentAsString()).get("id").asLong();
        assertEquals(orderId, dupOrderId, "Backend duplicate protection should reuse the existing pending order");

        // 3. Initiate payment
        PaymentInitiateRequest payInit = new PaymentInitiateRequest();
        payInit.setOrderId(orderId);

        MvcResult initRes = mockMvc.perform(post("/api/payments/initiate")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payInit)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").isNumber())
                .andExpect(jsonPath("$.canteenUpiId").value("anuragcanteen@upi"))
                .andReturn();

        long paymentId = objectMapper.readTree(initRes.getResponse().getContentAsString()).get("paymentId").asLong();

        User otherUser = new User();
        otherUser.setName("Other Integration User");
        otherUser.setEmail("other-" + UUID.randomUUID() + "@example.test");
        otherUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        otherUser.setRole(Role.STUDENT);
        otherUser = userRepository.save(otherUser);
        String otherToken = jwtService.generateToken(otherUser.getEmail(), otherUser.getRole().name());

        mockMvc.perform(get("/api/payments/" + paymentId + "/status")
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/payments/order/" + orderId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/payments/" + paymentId + "/status")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());

        // 4. Test Card Demo Simulation
        mockMvc.perform(post("/api/payments/" + paymentId + "/simulate-card")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.paymentMethod").value("CARD_DEMO"));

        // 5. Verify order is now CONFIRMED and PAID
        mockMvc.perform(get("/api/orders/" + orderId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderStatus").value("CONFIRMED"))
                .andExpect(jsonPath("$.paymentStatus").value("PAID"));
    }

    @Test
    void testPayAtCanteenFlow() throws Exception {
        // Place a second order for Pay-at-canteen test
        OrderRequest orderReq = new OrderRequest();
        orderReq.setMealCategory(testItem.getMealType() != null ? testItem.getMealType() : MealType.TIFFIN);
        orderReq.setPickupSlot("09:00 AM - 10:00 AM");

        OrderItemRequest itemReq = new OrderItemRequest();
        itemReq.setMenuItemId(testItem.getId());
        itemReq.setQuantity(1);
        orderReq.setItems(List.of(itemReq));

        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();

        long orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).get("id").asLong();

        // Initiate payment
        PaymentInitiateRequest payInit = new PaymentInitiateRequest();
        payInit.setOrderId(orderId);

        MvcResult initRes = mockMvc.perform(post("/api/payments/initiate")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payInit)))
                .andExpect(status().isOk())
                .andReturn();

        long paymentId = objectMapper.readTree(initRes.getResponse().getContentAsString()).get("paymentId").asLong();

        // Pay at canteen
        mockMvc.perform(post("/api/payments/" + paymentId + "/pay-at-canteen")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentMethod").value("PAY_AT_CANTEEN"))
                .andExpect(jsonPath("$.status").value("PENDING"));

        // Order is CONFIRMED for preparation but paymentStatus is PENDING
        mockMvc.perform(get("/api/orders/" + orderId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderStatus").value("CONFIRMED"))
                .andExpect(jsonPath("$.paymentStatus").value("PENDING"));
    }
}
