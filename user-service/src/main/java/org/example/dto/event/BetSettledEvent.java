package org.example.dto.event;

import java.time.LocalDateTime;

public record BetSettledEvent(
        Long userId,
        Long betId,
        Double payoutAmount,
        String status, // "WON", "LOST"
        LocalDateTime occurredAt
) {}
