package com.smartmeal.service;

import com.smartmeal.entity.User;
import com.smartmeal.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean existsByRollNumber(String rollNumber) {
        return rollNumber != null && !rollNumber.isBlank() && userRepository.existsByRollNumber(rollNumber);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }
}
