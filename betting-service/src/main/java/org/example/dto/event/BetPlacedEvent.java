package org.example.dto.event;

import java.time.LocalDateTime;

public record BetPlacedEvent(
        Long userId,
        Long betId,
        Double amount,
        LocalDateTime occurredAt
) {}