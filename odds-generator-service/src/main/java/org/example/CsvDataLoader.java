package org.example;


import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class CsvDataLoader  implements CommandLineRunner {
    private final MatchStatsRepository matchRepository;

    @Override
    public void run(String... args) throws Exception {
        //laduej tylko raz jak baza jest pusta
        if (matchRepository.count() > 0) {
            return;
        }

        System.out.println("ladowanie csv");

        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                getClass().getResourceAsStream("/LaLiga_stats.csv")))) {

            String line;
            boolean isHeader = true;

            while ((line = br.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                String[] data = line.split(",");

                try {
                    MatchStats stats = MatchStats.builder()
                            .date(LocalDate.parse(data[1]))
                            .team(data[2])
                            .opponent(data[3])
                            .venue(data[4])
                            .goalsScored(Integer.parseInt(data[5]))
                            .goalsConceded(Integer.parseInt(data[6]))
                            .npxgCreated(Double.parseDouble(data[7]))
                            .sotFor(Integer.parseInt(data[8]))
                            .scaFor(Double.parseDouble(data[9]))
                            .npxgConceded(Double.parseDouble(data[10]))
                            .sotAgainst(Integer.parseInt(data[11]))
                            .scaAgainst(Double.parseDouble(data[12]))
                            .build();

                    matchRepository.save(stats);
                } catch (Exception e) {
                    System.err.println("blad wiersza: " + line + " -> " + e.getMessage());
                }
            }
        }
        System.out.println("zaladowano do bazy " + matchRepository.count());

        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                getClass().getResourceAsStream("/PremierLeague_stats.csv")))) {

            String line;
            boolean isHeader = true;

            while ((line = br.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                String[] data = line.split(",");

                try {
                    MatchStats stats = MatchStats.builder()
                            .date(LocalDate.parse(data[1]))
                            .team(data[2])
                            .opponent(data[3])
                            .venue(data[4])
                            .goalsScored(Integer.parseInt(data[5]))
                            .goalsConceded(Integer.parseInt(data[6]))
                            .npxgCreated(Double.parseDouble(data[7]))
                            .sotFor(Integer.parseInt(data[8]))
                            .scaFor(Double.parseDouble(data[9]))
                            .npxgConceded(Double.parseDouble(data[10]))
                            .sotAgainst(Integer.parseInt(data[11]))
                            .scaAgainst(Double.parseDouble(data[12]))
                            .build();

                    matchRepository.save(stats);
                } catch (Exception e) {
                    System.err.println("blad wiersza: " + line + " -> " + e.getMessage());
                }
            }
        }
        System.out.println("zaladowano do bazy " + matchRepository.count());
    }

}