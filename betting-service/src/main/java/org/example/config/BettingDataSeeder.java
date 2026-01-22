package org.example.config;

import lombok.RequiredArgsConstructor;
import org.example.entity.Sport;
import org.example.entity.enums.EventStatus;
import org.example.repository.SportRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

//generuje sporty jakie sa dostepne w ofercie
@Component
@RequiredArgsConstructor
public class BettingDataSeeder implements CommandLineRunner {

    private final SportRepository sportRepository;


    @Override
    @Transactional
    public void run(String... args) {

        if (sportRepository.count() > 0) {
            return;
        }
        Sport football = new Sport();
        football.setSportName("Football");
        sportRepository.save(football);

    }
}