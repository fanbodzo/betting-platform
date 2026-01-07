package org.example.repository;

import org.example.entity.Bet;
import org.example.entity.enums.BetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BetRepository extends JpaRepository<Bet, Long> {
    List<Bet> findByUserIdAndBetStatusByCreatedAtDesc(Long userId ,BetStatus status);
}
