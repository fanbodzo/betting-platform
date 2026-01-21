package org.example.dto;

import java.time.LocalDate;

public record MatchHistoryDto(
        LocalDate date,
        String homeTeam,
        String awayTeam,
        int homeGoals,
        int awayGoals,
        double homeXg,
        double awayXg,
        double homeSca,
        double awaySca,
        double homeSot,
        double awaySot,
        double homeXgConceded,
        double awayXgConceded
) {}