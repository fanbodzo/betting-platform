package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.Entity.User;
import org.example.dto.UserDto;
import org.example.repository.UserRepository;
import org.example.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    @GetMapping("/{userId}/balance")
    public ResponseEntity<Double> getUserBalance(@PathVariable Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new UsernameNotFoundException("user not found with id: " + userId));
        return ResponseEntity.ok(user.getCashBalance());
    }

    @PostMapping("/{userId}/balance/deduct")
    public ResponseEntity<Double> deductBalance(@PathVariable("userId") Long userId
            , @RequestParam("amount") Double amount){
        System.out.println("DEBUG: UserController odebrał żądanie deductBalance! User: " + userId + ", Kwota: " + amount);

        User user = userRepository.findById(userId).orElseThrow(() -> new UsernameNotFoundException("user not found with id: " + userId));
        user.setCashBalance(user.getCashBalance() - amount);
        userRepository.save(user);
        return ResponseEntity.ok(user.getCashBalance());
    }

    @PostMapping("/{userId}/balance/add")
    public ResponseEntity<Double> addBalance(@PathVariable("userId") Long userId
            , @RequestParam("amount") Double amount){
        User user = userRepository.findById(userId).orElseThrow(() -> new UsernameNotFoundException("user not found with id: " + userId));
        user.setCashBalance(user.getCashBalance() + amount);
        userRepository.save(user);
        return ResponseEntity.ok(user.getCashBalance());
    }

}
