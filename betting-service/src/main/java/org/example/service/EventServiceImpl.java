package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.dto.EventDto;
import org.example.dto.MarketDto;
import org.example.dto.OddDto;
import org.example.entity.Event;
import org.example.entity.Market;
import org.example.entity.enums.EventStatus;
import org.example.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    private EventDto mapToEventDto(Event event) {
        EventDto dto = new EventDto();
        dto.setEventId(event.getId());
        dto.setEventName(event.getEventName());
        dto.setStartTime(event.getStartTime());

        //mappin grynkow
        List<MarketDto> marketDtos = event.getMarkets().stream()
                .map(this::mapToMarketDto)
                .collect(Collectors.toList());

        dto.setMarkets(marketDtos);
        return dto;
    }

    private MarketDto mapToMarketDto(Market market) {
        MarketDto dto = new MarketDto();
        dto.setMarketId(Long.valueOf(market.getMarketId()));
        dto.setMarketName(market.getMarketName());

        //mapping kursow
        List<OddDto> oddDtos = market.getOdds().stream()
                .map(odd -> new OddDto(odd.getOddId(), odd.getOutcomeName(), odd.getOddValue()))
                .collect(Collectors.toList());

        dto.setOdds(oddDtos);
        return dto;
    }

    @Override
    public List<EventDto> deleteAllActiveEvents(){
        List<Event> events = eventRepository.findAll();
        eventRepository.deleteAll(events);

        return events.stream().map(this::mapToEventDto).collect(Collectors.toList());
    }

    @Override
    public EventDto deleteEventById(int id){
        Event event = eventRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Event not found with id: " + id));
        EventDto deletedEventDto = mapToEventDto(event);

        eventRepository.delete(event);

        return deletedEventDto;

    }
    @Override
    @Transactional(readOnly = true)
    public List<EventDto> getEventByStatus(String status)
    {

        List<Event> events = eventRepository.findByEventStatus(EventStatus.valueOf(status.toUpperCase()));

        return events.stream().map(this::mapToEventDto).collect(Collectors.toList());
    }
}