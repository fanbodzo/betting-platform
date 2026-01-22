package org.example;

import lombok.RequiredArgsConstructor;
import org.example.dto.MatchStatsDto;
import org.example.dto.TeamStatsHistoryDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final MatchStatsRepository repository;

    public TeamStatsHistoryDto getTeamHistory(String teamName) {

        List<MatchStats> matches = repository.findTop5ByTeamOrderByDateDesc(teamName);

        List<MatchStatsDto> dtos = matches.stream()
                .map(m -> new MatchStatsDto(
                        m.getDate(),
                        m.getOpponent(),
                        m.getVenue(),
                        m.getGoalsScored(),
                        m.getGoalsConceded(),
                        m.getNpxgCreated(),
                        m.getNpxgConceded()
                ))
                .collect(Collectors.toList());

        return new TeamStatsHistoryDto(teamName, dtos);
    }
}
