package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.admin.CreateEventRequest;
import org.example.dto.admin.CreateMarketRequest;
import org.example.dto.admin.CreateOddRequest;
import org.example.dto.admin.SettleMarketRequest;
import org.example.entity.Event;
import org.example.entity.Market;
import org.example.entity.Odd;
import org.example.service.OfferManagementService;
import org.example.service.SettlementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SettlementService settlementService;
    private final OfferManagementService offerManagementService;

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
}
