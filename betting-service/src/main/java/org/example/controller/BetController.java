package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.BetHistoryDto;
import org.example.dto.PlaceBetRequestDto;
import org.example.service.BetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bets")
@RequiredArgsConstructor
public class BetController {
    private final BetService betService;

    @PostMapping("/{userId}")
    public ResponseEntity<Void> placeBet(@PathVariable Long userId , @RequestBody PlaceBetRequestDto requestDto){
        betService.placeBet(userId, requestDto.getStake());

        return ResponseEntity.ok().build();
    }
    @GetMapping("/{userId}")
    public ResponseEntity<List<BetHistoryDto>> getUserBets(@PathVariable Long userId
            , @RequestParam(required = false) String status) {

        List<BetHistoryDto> bets = betService.getUserBets(userId, status);

        return ResponseEntity.ok(bets);

    }

}
