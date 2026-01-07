package org.example.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.dto.admin.CreateEventRequest;
import org.example.dto.admin.CreateMarketRequest;
import org.example.dto.admin.CreateOddRequest;
import org.example.entity.Event;
import org.example.entity.Market;
import org.example.entity.Odd;
import org.example.entity.Sport;
import org.example.entity.enums.EventStatus;
import org.example.repository.EventRepository;
import org.example.repository.MarketRepository;
import org.example.repository.OddRepository;
import org.example.repository.SportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OfferManagementServiceImpl implements OfferManagementService {

    private final EventRepository eventRepository;
    private final SportRepository sportRepository;
    private final MarketRepository marketRepository;
    private final OddRepository oddRepository;

    @Override
    @Transactional
    public Event createEvent(CreateEventRequest request){

        Sport sport = sportRepository.findById(request.sportId())
                .orElseThrow(() -> new EntityNotFoundException("Sport not found with id: " + request.sportId()));

        Event event = Event.builder()
                .sports(sport)
                .eventName(request.eventName())
                .startTime(request.startTime())
                .eventStatus(EventStatus.UPCOMING)
                .build();

        return eventRepository.save(event);
    }

    @Override
    @Transactional
    public Market createMarket(Long eventId, CreateMarketRequest request) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

        Market market = Market.builder()
                .event(event)
                .marketName(request.marketName())
                .isSettled(false)
                .build();

        return marketRepository.save(market);
    }

    @Override
    @Transactional
    public Odd createOdd(Long marketId, CreateOddRequest request) {

        Market market = marketRepository.findById(marketId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("Market not found with id: " + marketId));

        Odd odd = Odd.builder()
                .market(market)
                .outcomeName(request.outcomeName())
                .oddValue(request.oddValue())
                .isActive(true)
                .build();

        return oddRepository.save(odd);
    }
}
