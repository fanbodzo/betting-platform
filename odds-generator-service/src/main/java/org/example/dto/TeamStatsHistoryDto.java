package org.example.dto;

import java.util.List;

public record TeamStatsHistoryDto(
        String teamName,
        List<MatchStatsDto> last5Matches
) {}
