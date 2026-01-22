package org.example.dto;

import java.time.LocalDate;

public record MatchStatsDto(
        LocalDate date,
        String opponent,
        String venue,
        int goalsScored,
        int goalsConceded,
        double xG,
        double xGConceded
) {}
