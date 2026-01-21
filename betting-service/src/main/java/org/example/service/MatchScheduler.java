package org.example.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.client.OddsGeneratorClient;
import org.example.dto.MatchHistoryDto;
import org.example.entity.Event;
import org.example.entity.Market;
import org.example.entity.Odd;
import org.example.entity.enums.EventStatus;
import org.example.repository.EventRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchScheduler {

    private final EventRepository eventRepository;
    private final MatchSimulator matchSimulator;
    private final SettlementService settlementService;
    private final OddsGeneratorClient oddsGeneratorClient;

    // uruchamai sie co minute przydatne bedzie do testow
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processFinishedMatches() {
        log.info("Sprawdzam, czy są mecze do rozliczenia...");

        List<Event> finishedEvents = eventRepository.findByStartTimeBeforeAndEventStatus(
                LocalDateTime.now(), EventStatus.UPCOMING);

        for (Event event : finishedEvents) {
            log.info("Rozliczam mecz: {}", event.getEventName());

            // 2. Symuluj wynik
            MatchSimulator.SimulationResult result = matchSimulator.simulateMatch(event);
            log.info("Wynik: {} - {} (Wygrał: {})", result.homeGoals(), result.awayGoals(), result.winner());

            // 3. Znajdź ID zwycięskiego kursu
            Market market = event.getMarkets().stream()
                    .filter(m -> "Match Winner".equals(m.getMarketName()))
                    .findFirst()
                    .orElse(null);

            if (market != null) {
                Odd winningOdd = market.getOdds().stream()
                        .filter(o -> o.getOutcomeName().equals(result.winner()))
                        .findFirst()
                        .orElse(null);

                if (winningOdd != null) {
                    // 4. Rozlicz rynek
                    settlementService.settleMarket(Long.valueOf(market.getMarketId()), winningOdd.getOddId());
                }
            }

            try {
                String[] teams = event.getEventName().split(" vs ");
                String homeTeamName = teams[0].trim();
                String awayTeamName = teams[1].trim();

                MatchHistoryDto historyDto = new MatchHistoryDto(
                        event.getStartTime().toLocalDate(),
                        homeTeamName,
                        awayTeamName,
                        result.homeGoals(),
                        result.awayGoals(),
                        result.homeXg(),
                        result.awayXg(),
                        (double) result.homeSca(),
                        (double) result.awaySca(),
                        (double) result.homeSot(),
                        (double) result.awaySot(),
                        result.homeXgConceded(),
                        result.awayXgConceded()
                );

                // Wołamy klienta Feign (musisz go wstrzyknąć w klasie MatchScheduler!)
                oddsGeneratorClient.saveMatchHistory(historyDto);
                log.info("Wysłano historię meczu do generatora.");

            } catch (Exception e) {
                log.error("Nie udało się zapisać historii meczu w generatorze: " + e.getMessage());
            }

        }
    }
}