package org.example.dto.admin;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreateEventRequest(
        @NotNull(message = "sportId jest wymagane")
        Integer sportId,
        @NotNull(message = "zdarzenie musi zaweirac druzyny")
        String eventName,
        @Future(message = "data wydarzenia musi byc w przyszlosci")
        LocalDateTime startTime
) {}