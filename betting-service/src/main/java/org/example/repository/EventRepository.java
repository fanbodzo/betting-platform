package org.example.repository;

import org.example.entity.Event;
import org.example.entity.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    Optional<Event> getEventsById(Long eventId);
    List<Event> findByEventStatus(EventStatus status);
}
