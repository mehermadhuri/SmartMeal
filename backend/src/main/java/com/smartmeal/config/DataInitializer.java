package com.smartmeal.config;

import com.smartmeal.entity.*;
import com.smartmeal.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MenuRepository menuRepository;
    private final MealSlotRepository mealSlotRepository;
    private final MealPredictionRepository mealPredictionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            MenuRepository menuRepository,
            MealSlotRepository mealSlotRepository,
            MealPredictionRepository mealPredictionRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.menuRepository = menuRepository;
        this.mealSlotRepository = mealSlotRepository;
        this.mealPredictionRepository = mealPredictionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedMenus();
        seedSlots();
        seedPredictions();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@anurag.edu.in")) {
            User admin = new User();
            admin.setName("Canteen Administrator");
            admin.setEmail("admin@anurag.edu.in");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRollNumber("ADMIN-001");
            admin.setPhoneNumber("9876543210");
            admin.setDepartment("Canteen Administration");
            admin.setYear(4);
            admin.setRole(Role.ADMIN);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
        }

        if (!userRepository.existsByEmail("mehermadhuri7@gmail.com")) {
            User student = new User();
            student.setName("KOTA MEHER MADHURI");
            student.setEmail("mehermadhuri7@gmail.com");
            student.setPassword(passwordEncoder.encode("Student@123"));
            student.setRollNumber("21H61A0501");
            student.setPhoneNumber("9876543210");
            student.setDepartment("Computer Science & Engineering");
            student.setYear(4);
            student.setRole(Role.STUDENT);
            student.setCreatedAt(LocalDateTime.now());
            userRepository.save(student);
        }
    }

    private void seedMenus() {
        if (menuRepository.count() == 0) {
            // Tiffin items
            createMenu("Idly", "Soft steamed rice cakes served with coconut chutney & piping hot sambar (2 pcs)", MealType.TIFFIN, new BigDecimal("30.00"), "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600", 60, "08:00", LocalDateTime.now().withHour(10).withMinute(0));
            createMenu("Poori", "Golden crispy puffed wheat pooris served with spiced potato aloo bhaji (2 pcs)", MealType.TIFFIN, new BigDecimal("35.00"), "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", 50, "08:00", LocalDateTime.now().withHour(10).withMinute(0));
            createMenu("Plain Dosa", "Traditional crispy golden brown fermented rice crepe served with trio chutneys", MealType.TIFFIN, new BigDecimal("30.00"), "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600", 70, "08:00", LocalDateTime.now().withHour(10).withMinute(0));
            createMenu("Masala Dosa", "Crispy butter roasted dosa filled with spiced potato onion masala & gun powder", MealType.TIFFIN, new BigDecimal("45.00"), "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600", 75, "08:00", LocalDateTime.now().withHour(10).withMinute(0));
            createMenu("Vada", "Crispy golden lentil fritters tempered with pepper, curry leaves & ginger (2 pcs)", MealType.TIFFIN, new BigDecimal("25.00"), "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600", 55, "08:00", LocalDateTime.now().withHour(10).withMinute(0));
            createMenu("Upma", "Savory roasted semolina tempered with mustard seeds, curry leaves & cashew nuts", MealType.TIFFIN, new BigDecimal("30.00"), "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600", 40, "08:00", LocalDateTime.now().withHour(10).withMinute(0));
            createMenu("Pongal", "Ghee-laden comforting rice and moong dal porridge with black pepper & cumin", MealType.TIFFIN, new BigDecimal("35.00"), "https://images.unsplash.com/photo-1630409346824-4f0e7b080087?w=600", 45, "08:00", LocalDateTime.now().withHour(10).withMinute(0));
            createMenu("Pesarattu", "Nutritious whole green gram crepe served with authentic ginger allam pachadi", MealType.TIFFIN, new BigDecimal("40.00"), "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600", 35, "08:00", LocalDateTime.now().withHour(10).withMinute(0));

            // Lunch items
            createMenu("Chicken Biryani", "Fragrant Hyderabadi dum biryani cooked with marinated succulent chicken and spices", MealType.LUNCH, new BigDecimal("100.00"), "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600", 120, "11:30", LocalDateTime.now().withHour(14).withMinute(0));
            createMenu("Veg Biryani", "Aromatic basmati rice cooked with fresh seasonal vegetables, mint and saffron", MealType.LUNCH, new BigDecimal("90.00"), "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600", 80, "11:30", LocalDateTime.now().withHour(14).withMinute(0));
            createMenu("Meals", "South Indian thali: steamed rice, sambar, rasam, curd, 2 curries, papad & pickle", MealType.LUNCH, new BigDecimal("60.00"), "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600", 150, "11:30", LocalDateTime.now().withHour(14).withMinute(0));
            createMenu("Curd Rice", "Cooling tempered seasoned curd rice topped with pomegranate and mustard tempering", MealType.LUNCH, new BigDecimal("40.00"), "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600", 60, "11:30", LocalDateTime.now().withHour(14).withMinute(0));
            createMenu("Lemon Rice", "Zesty turmeric seasoned tangy lemon rice with crunchy peanuts and curry leaves", MealType.LUNCH, new BigDecimal("50.00"), "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600", 50, "11:30", LocalDateTime.now().withHour(14).withMinute(0));
            createMenu("Sambar Rice", "Flavorful rice cooked with hearty lentil sambar, vegetables & pure desi ghee", MealType.LUNCH, new BigDecimal("50.00"), "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600", 55, "11:30", LocalDateTime.now().withHour(14).withMinute(0));
            createMenu("Egg Fried Rice", "Wok-tossed aromatic rice with scrambled eggs, scallions, pepper and soy sauce", MealType.LUNCH, new BigDecimal("70.00"), "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600", 70, "11:30", LocalDateTime.now().withHour(14).withMinute(0));
        }
    }

    private void createMenu(String name, String desc, MealType type, BigDecimal price, String imageUrl, int qty, String start, LocalDateTime cutoff) {
        Menu item = new Menu();
        item.setName(name);
        item.setDescription(desc);
        item.setMealType(type);
        item.setPrice(price);
        item.setImageUrl(imageUrl);
        item.setAvailableQuantity(qty);
        item.setBookingStart(start);
        item.setBookingCutoff(cutoff);
        item.setAvailable(true);
        item.setDate(LocalDate.now());
        item.setCreatedAt(LocalDateTime.now());
        menuRepository.save(item);
    }

    private void seedSlots() {
        if (mealSlotRepository.count() == 0) {
            mealSlotRepository.save(new MealSlot(MealType.TIFFIN, "08:00 AM - 09:00 AM", LocalTime.of(8, 0), LocalTime.of(9, 0), 100));
            mealSlotRepository.save(new MealSlot(MealType.TIFFIN, "09:00 AM - 10:00 AM", LocalTime.of(9, 0), LocalTime.of(10, 0), 100));
            mealSlotRepository.save(new MealSlot(MealType.LUNCH, "11:30 AM - 12:45 PM", LocalTime.of(11, 30), LocalTime.of(12, 45), 150));
            mealSlotRepository.save(new MealSlot(MealType.LUNCH, "12:45 PM - 02:00 PM", LocalTime.of(12, 45), LocalTime.of(14, 0), 150));
        }
    }

    private void seedPredictions() {
        if (mealPredictionRepository.count() == 0) {
            LocalDate today = LocalDate.now();
            createPrediction(today, MealType.TIFFIN, "08:00 AM - 09:00 AM", 85, 92);
            createPrediction(today, MealType.TIFFIN, "09:00 AM - 10:00 AM", 75, 82);
            createPrediction(today, MealType.LUNCH, "11:30 AM - 12:45 PM", 120, 130);
            createPrediction(today, MealType.LUNCH, "12:45 PM - 02:00 PM", 140, 152);

            LocalDate tomorrow = today.plusDays(1);
            createPrediction(tomorrow, MealType.TIFFIN, "08:00 AM - 09:00 AM", 88, 96);
            createPrediction(tomorrow, MealType.TIFFIN, "09:00 AM - 10:00 AM", 78, 85);
            createPrediction(tomorrow, MealType.LUNCH, "11:30 AM - 12:45 PM", 125, 136);
            createPrediction(tomorrow, MealType.LUNCH, "12:45 PM - 02:00 PM", 145, 158);
        }
    }

    private void createPrediction(LocalDate date, MealType type, String slot, int predicted, int recommended) {
        MealPrediction p = new MealPrediction();
        p.setDate(date);
        p.setMealType(type);
        p.setSlot(slot);
        p.setPredictedDemand(predicted);
        p.setRecommendedQuantity(recommended);
        p.setCreatedAt(LocalDateTime.now());
        mealPredictionRepository.save(p);
    }
}
