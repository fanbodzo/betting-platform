package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.EventDto;
import org.example.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllActiveEvents());
    }

    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEventsByStatus(@RequestParam(required = false) String status ) {
        List<EventDto> events = eventService.getEventByStatus(status);

        return ResponseEntity.ok(events);
    }

    @DeleteMapping
    public ResponseEntity<List<EventDto>> deleteAllEvents() {
        return ResponseEntity.ok(eventService.deleteAllActiveEvents());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<EventDto> deleteEvent(@PathVariable Integer id) {
        return ResponseEntity.ok(eventService.deleteEventById(id));
    }
}