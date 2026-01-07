package org.example.dto.event;

import java.time.LocalDateTime;

public record UserRegisteredEvent(Long userId,
                                  String username,
                                  String email,
                                  LocalDateTime registeredAt
){}
