package org.example.service;

import org.example.entity.Event;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class MatchSimulator {

    private final Random random = new Random();

    // DTO z wynikami symulacji
    public record SimulationResult(
            int homeGoals, int awayGoals, String winner,
            double homeXg, double awayXg,
            double homeSca, double awaySca,
            double homeSot, double awaySot,
            double homeXgConceded, double awayXgConceded
    ) {}

    public SimulationResult simulateMatch(Event event) {
        // 1. Wyciągnij nazwy drużyn z eventName
        String[] teams = event.getEventName().split(" vs ");
        String homeTeamName = teams[0].trim();
        String awayTeamName = teams[1].trim();



        // 2. Ustal Tier
        Tier homeTier = determineTier(homeTeamName);
        Tier awayTier = determineTier(awayTeamName);

        // 3. Generuj statystyki HOME
        int homeGoals = generateInt(homeTier.minGoals, homeTier.maxGoals);
        double homeXg = generateDouble(homeTier.minNpxg, homeTier.maxNpxg);
        double homeSca = generateDouble(homeTier.minSca, homeTier.maxSca);
        double homeSot = generateDouble(homeTier.minSot, homeTier.maxSot);
        double homeXgConceded = generateDouble(homeTier.minNpxgConceded, homeTier.maxNpxgConceded);

        // 4. Generuj statystyki AWAY
        int awayGoals = generateInt(awayTier.minGoals, awayTier.maxGoals);
        double awayXg = generateDouble(awayTier.minNpxg, awayTier.maxNpxg);
        double awaySca = generateDouble(awayTier.minSca,awayTier.maxSca);
        double awaySot = generateDouble(awayTier.minSot,awayTier.maxSot);
        double awayXgConceded = generateDouble(awayTier.minNpxgConceded, awayTier.maxNpxgConceded);

        // 5. Ustal zwycięzcę
        String winner;
        if (homeGoals > awayGoals) winner = homeTeamName;
        else if (homeGoals < awayGoals) winner = awayTeamName;
        else winner = "Draw";

        return new SimulationResult(
                homeGoals, awayGoals, winner,
                homeXg, awayXg,
                homeSca, awaySca,
                homeSot, awaySot,
                homeXgConceded, awayXgConceded
        );
    }

    private int generateInt(double min, double max) {
        return (int) (min + (max - min) * random.nextDouble());
    }

    private double generateDouble(double min, double max) {
        return min + (max - min) * random.nextDouble();
    }

    private Tier determineTier(String teamName) {
        // Tu Twoja logika rozpoznawania drużyn
        if (teamName.contains("Real") || teamName.contains("Barcelona") || teamName.contains("Atletico")) return Tier.TOP;
        if (teamName.contains("Betis") || teamName.contains("Villareal") || teamName.contains("Celta")) return Tier.MID;
        return Tier.WEAK;
    }

    // Pełny Enum zgodny z Twoją tabelką
    private enum Tier {
        TOP (0, 5,  0.60, 2.70,  14.0,
                42.0,  2.0, 9.0,   0.30, 2.10),
        MID (0, 4,  0.40, 2.20,  10.0,
                34.0,  1.0, 7.0,   0.50, 2.40),
        WEAK(0, 3,  0.30, 1.70,   8.0,
                29.0,  1.0, 6.0,   0.60, 2.60);

        final double minGoals, maxGoals;
        final double minNpxg, maxNpxg;
        final double minSca, maxSca;
        final double minSot, maxSot;
        final double minNpxgConceded, maxNpxgConceded;

        Tier(double minGoals, double maxGoals,
             double minNpxg, double maxNpxg,
             double minSca, double maxSca,
             double minSot, double maxSot,
             double minNpxgConceded, double maxNpxgConceded) {
            this.minGoals = minGoals;
            this.maxGoals = maxGoals;
            this.minNpxg = minNpxg;
            this.maxNpxg = maxNpxg;
            this.minSca = minSca;
            this.maxSca = maxSca;
            this.minSot = minSot;
            this.maxSot = maxSot;
            this.minNpxgConceded = minNpxgConceded;
            this.maxNpxgConceded = maxNpxgConceded;
        }
    }
}