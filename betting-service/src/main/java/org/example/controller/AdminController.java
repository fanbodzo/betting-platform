package org.example.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.client.OddsGeneratorClient;
import org.example.dto.admin.CreateEventRequest;
import org.example.dto.admin.CreateMarketRequest;
import org.example.dto.admin.CreateOddRequest;
import org.example.dto.admin.SettleMarketRequest;
import org.example.entity.Event;
import org.example.entity.Market;
import org.example.entity.Odd;
import org.example.repository.EventRepository;
import org.example.service.OfferManagementService;
import org.example.service.SettlementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SettlementService settlementService;
    private final OfferManagementService offerManagementService;
    private final OddsGeneratorClient oddsGeneratorClient;
    private final EventRepository eventRepository;

    @PostMapping("/settle/market/{marketId}")
    public ResponseEntity<String> settleMarket(@PathVariable Long marketId, @RequestBody SettleMarketRequest request) {
        settlementService.settleMarket(marketId, request.winningOddId());

        return ResponseEntity.ok("Market with ID: " + marketId + " settled successfully.");
    }

    //zarzadzanie zdarzeniami
    @PostMapping("/events")
    public ResponseEntity<Event> createEvent(@RequestBody CreateEventRequest request) {

        Event newEvent = offerManagementService.createEvent(request);

        return new ResponseEntity<>(newEvent, HttpStatus.CREATED);
    }

    //zaradzanie marketami
    @PostMapping("/events/{eventId}/markets")
    public ResponseEntity<Market> createMarket(@PathVariable Long eventId, @RequestBody CreateMarketRequest request) {

        Market newMarket = offerManagementService.createMarket(eventId, request);

        return new ResponseEntity<>(newMarket, HttpStatus.CREATED);
    }

    //zarzadzanie stawkami
    @PostMapping("/markets/{marketId}/odds")
    public ResponseEntity<Odd> createOdd(@PathVariable Long marketId, @RequestBody CreateOddRequest request) {

        Odd newOdd = offerManagementService.createOdd(marketId, request);

        return new ResponseEntity<>(newOdd, HttpStatus.CREATED);
    }

    @PostMapping("/events/create-auto")
    public ResponseEntity<Event> createEventAuto(@Valid @RequestBody CreateEventRequest request) {

        //parsownanie nazw
        String[] teams = request.eventName().split(" vs ");
        if (teams.length != 2) throw new IllegalArgumentException("Format: Home vs Away");
        String homeTeam = teams[0].trim();
        String awayTeam = teams[1].trim();

        //zapytanie do generatora po kursy na mecz
        Map<String, String> genRequest = Map.of("homeTeam", homeTeam, "awayTeam", awayTeam);
        Map<String, Double> odds = oddsGeneratorClient.generateOdds(genRequest);

        //zapis tego meczu
        Event event = offerManagementService.createEvent(request);
        //zostawiam legacy do testu
//        CreateEventRequest fullRequest = new CreateEventRequest(
//                39, //ustawiam na szytwo zeby przeszlo
//                request.eventName(),
//                request.startTime()
//        );

        //Event event = offerManagementService.createEvent(fullRequest);

        //zapis rynku
        Market market = offerManagementService.createMarket(event.getId(), new CreateMarketRequest("Match Winner"));

        // 5. Zapis Kursów (Odds) - konwersja Double -> BigDecimal
        offerManagementService.createOdd(Long.valueOf(market.getMarketId()), new CreateOddRequest(homeTeam, odds.get("homeOdd")));
        offerManagementService.createOdd(Long.valueOf(market.getMarketId()), new CreateOddRequest("Draw", odds.get("drawOdd")));
        offerManagementService.createOdd(Long.valueOf(market.getMarketId()), new CreateOddRequest(awayTeam, odds.get("awayOdd")));

        return ResponseEntity.ok(event);
    }
}
