package org.example.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.client.UserClient;
import org.example.config.RabbitMQConfig;
import org.example.dto.event.BetSettledEvent;
import org.example.entity.Bet;
import org.example.entity.BetSelection;
import org.example.entity.Event;
import org.example.entity.Market;
import org.example.entity.enums.BetStatus;
import org.example.entity.enums.EventStatus;
import org.example.repository.*;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettlementServiceImpl implements SettlementService {

    private final MarketRepository marketRepository;
    private final BetSelectionRepository betSelectionRepository;
    private final BetRepository betRepository;
    private final UserClient userClient;
    private final RabbitTemplate rabbitTemplate;
    private final EventRepository eventRepository;

    @Override
    @Transactional
    public void settleMarket(Long marketId, Long winningOddId) {

        Market market = marketRepository.findById(marketId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("Market not found with id: " + marketId));

        if (market.isSettled()) {
            throw new IllegalStateException("Market with id: " + marketId + " is already settled.");
        }
        market.setSettled(true);
        marketRepository.save(market);

        Event event = market.getEvent();

        List<BetSelection> selections = betSelectionRepository.findAllByMarket_MarketId(marketId);

        for (BetSelection selection : selections) {
            updateSelectionStatus(selection, winningOddId);
        }
        Set<Long> affectedBetIds = selections.stream()
                .map(sel -> sel.getBet().getBetId())
                .collect(Collectors.toSet());


        for (Long betId : affectedBetIds) {
            checkAndFinalizeBetStatus(betId);
        }
        event.setEventStatus(EventStatus.FINISHED);
        eventRepository.save(event);
        
    }

    private void checkAndFinalizeBetStatus(Long betId) {
        Bet bet = betRepository.findById(betId)
                .orElseThrow(() -> new EntityNotFoundException("Bet not found with id: " + betId));

        //sprawdzenie rozliecznia w tym zakladzie
        boolean allSelectionsSettled = bet.getSelections().stream()
                .allMatch(s -> s.getSelectionStatus() != BetStatus.PENDING);

        if (!allSelectionsSettled) {
            return;
        }

        //jezli wyszkie zdarzenia zakonczyly sie na markecie ustalam czy jest wygrany caly kupon
        boolean isBetWon = bet.getSelections().stream()
                .allMatch(s -> s.getSelectionStatus() == BetStatus.WON);

        if (isBetWon) {
            finalizeWinningBet(bet);
        } else {
            bet.setBetStatus(BetStatus.LOST);
            betRepository.save(bet);
        }
        //wygrana czy przegrana

        String status = isBetWon ? "WON" : "LOST";
        double payout = isBetWon ? bet.getPotentialPayout() : 0.0;

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "bet.settled",
                new BetSettledEvent(bet.getUserId(), bet.getBetId(), payout, status, LocalDateTime.now()));
    }

    private void finalizeWinningBet(Bet bet) {
        bet.setBetStatus(BetStatus.WON);
        userClient.addBalance(bet.getUserId(), bet.getPotentialPayout());
//        User user = bet.getUser();
//
//        Double newBalance = user.getCashBalance() + bet.getPotentialPayout();
//        user.setCashBalance(newBalance);
//
//        //ransakcja do bazy
//        Transaction winningTransaction = Transaction.builder()
//                .user(user)
//                .transactionType(TransactionType.BET_WINNING)
//                .amount(bet.getPotentialPayout())
//                .relatedBet(bet)
//                .createdAt(LocalDateTime.now())
//                .build();
//
//        userRepository.save(user);
//        transactionRepository.save(winningTransaction);
        betRepository.save(bet);
    }


    private void updateSelectionStatus(BetSelection selection, Long winningOddId) {

        if (selection.getOdd().getOddId().equals(winningOddId)) {
            selection.setSelectionStatus(BetStatus.WON);
        } else {
            selection.setSelectionStatus(BetStatus.LOST);
        }

        //w transakcni sa zapisane zmiany tej glownej z settleMarket
        betSelectionRepository.save(selection);
    }
}
