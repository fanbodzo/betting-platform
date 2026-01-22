package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.Entity.Role;
import org.example.Entity.User;
import org.example.dto.UserDto;
import org.example.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    //do pobierania userow z bazy
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                //mapowanie kazdego usera na USerDto
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // metoda pomocnicza wywolywania w struimienui , w przyszlosci w osobnym pliku narazei jako testu tuaj jest
    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .cashBalance(user.getCashBalance())
                .bonusBalance(user.getBonusBalance())
                .roles(user.getRoles().stream()
                        //konwersja enuma na String
                        .map(Role::name)
                        .collect(Collectors.toSet()))
                .build();
    }

    @Transactional
    public Double deductBalance(Long userId, Double amount){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("user not found with id: " + userId));

        if(user.getCashBalance() < amount){
            throw new IllegalStateException("kwota wyplaty przekracza ilosc srodkow na koncie");
        }
        if(1.0 > amount){
            throw new IllegalStateException("nie mozna wyplacic mniej niz 1 zloty");
        }

        user.setCashBalance(Math.round((user.getCashBalance() - amount) * 100.0) / 100.0);
        userRepository.save(user);

        return user.getCashBalance();
    }

    @Transactional
    public Double addBalance(Long userId, Double amount){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("user not found with id: " + userId));

        if(amount < 1){
            throw new IllegalStateException("nie mozna wplacic mniej niz 1 zloty");
        }

        user.setCashBalance(Math.round((user.getCashBalance() + amount )* 100.0) / 100.0);
        userRepository.save(user);

        return user.getCashBalance();
    }
}
