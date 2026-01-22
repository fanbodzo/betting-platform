package org.example.dto;

import lombok.RequiredArgsConstructor;
import org.example.OddsService;
import org.example.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/generator")
@RequiredArgsConstructor
public class OddsController {
    private final OddsService oddsService;
    private final StatsService statsService;

    @PostMapping("/predict")
    public ResponseEntity<OddsResponse> predict(@RequestBody OddsRequest request) {
        return ResponseEntity.ok(oddsService.calculateOdds(request.homeTeam(), request.awayTeam()));
    }

    @PostMapping("/history/add")
    public void saveMatchHistory(@RequestBody MatchHistoryDto dto) {
        oddsService.saveMatchHistory(dto); // Metoda, którą zaraz dodasz w serwisie
    }

    @GetMapping("/stats/{teamName}")
    public ResponseEntity<TeamStatsHistoryDto> getTeamStats(@PathVariable String teamName) {
        return ResponseEntity.ok(statsService.getTeamHistory(teamName));
    }
}
