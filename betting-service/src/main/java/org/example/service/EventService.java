package org.example.service;


import org.example.dto.EventDto;

import java.util.List;

public interface EventService {
    List<EventDto> getAllActiveEvents();
    List<EventDto> deleteAllActiveEvents();
    EventDto deleteEventById(int id);
    List<EventDto> getEventByStatus(String status);
}
