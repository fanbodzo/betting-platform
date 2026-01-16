package org.example.dto;

import lombok.RequiredArgsConstructor;
import org.example.OddsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/generator")
@RequiredArgsConstructor
public class OddsController {
    private final OddsService service;

    @PostMapping("/predict")
    public ResponseEntity<OddsResponse> predict(@RequestBody OddsRequest request) {
        return ResponseEntity.ok(service.calculateOdds(request.homeTeam(), request.awayTeam()));
    }
}
