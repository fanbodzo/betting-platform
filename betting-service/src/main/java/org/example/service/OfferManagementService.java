package org.example.service;


import org.example.dto.admin.CreateEventRequest;
import org.example.dto.admin.CreateMarketRequest;
import org.example.dto.admin.CreateOddRequest;
import org.example.entity.Event;
import org.example.entity.Market;
import org.example.entity.Odd;

public interface OfferManagementService {
    public Event createEvent(CreateEventRequest request);
    public Market createMarket(Long eventId, CreateMarketRequest request);
    public Odd createOdd(Long marketId, CreateOddRequest request);
}
