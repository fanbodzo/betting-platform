package org.example.config;

import lombok.RequiredArgsConstructor;
import org.example.Entity.Role;
import org.example.Entity.User;
import org.example.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.Set;


//towrze userow w bazie jezeli nie ma nic
@Component
@RequiredArgsConstructor
public class UserDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        if (userRepository.count() > 0) {
            return;
        }

        System.out.println("SEEDING USER DATA...");

        //admin
        createUser("admin", "admin@test.com", "admin123", 0, Set.of(Role.ROLE_ADMIN, Role.ROLE_USER));

        //bogacz
        createUser("rich_player", "rich@test.com", "user123", 10000.00, Set.of(Role.ROLE_USER));

        //biedak
        createUser("poor_player", "poor@test.com", "user123", 5.00, Set.of(Role.ROLE_USER));

        System.out.println("USER DATA SEEDED!");
    }

    private void createUser(String username, String email, String password, double balance, Set<Role> roles) {
        Random r= new Random();
        User user = User.builder()
                .username(username)
                .email(email)
                .firstName("Test")
                .lastName("User")
                .personalIdNumber("2"+ String.valueOf(r.nextLong(999999999)))
                .passwordHash(passwordEncoder.encode(password))
                .cashBalance(balance)
                .bonusBalance(0.0)
                .createdAt(LocalDateTime.now())
                .roles(roles)
                .build();
        userRepository.save(user);
    }
}
