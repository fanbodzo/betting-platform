package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.client.UserClient;
import org.example.config.RabbitMQConfig;
import org.example.dto.BetCouponDto;
import org.example.dto.BetHistoryDto;
import org.example.dto.BetHistorySelectionDto;
import org.example.dto.BetSelectionDto;
import org.example.dto.event.BetPlacedEvent;
import org.example.entity.Bet;
import org.example.entity.BetSelection;
import org.example.entity.Market;
import org.example.entity.Odd;
import org.example.entity.enums.BetStatus;
import org.example.repository.*;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BetServiceImpl implements BetService {
    //wstrzykuje interfejsy bo spring data jpa tworzy w locie za mnie implementacje wiec jest ok
    private final CouponService couponService;
    private final BetSelectionRepository betSelectionRepository;
    private final BetRepository betRepository;
    private final OddRepository oddRepository;
    private final MarketRepository marketRepository;
    private final UserClient userClient;
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public void placeBet(Long userId , Double stake){
        BetCouponDto coupon = couponService.getCoupon(userId);

        if(coupon.getSelections().isEmpty()){
            throw new IllegalStateException("Nie mozna postawic zakladu poniewaz kupon jest pusty");
        }
        if(userClient.getUserBalance(userId) < stake){
            throw new IllegalStateException("nie wystarzcajaca ilsoc srodkow na koncie twoje saldo to: "
            + userClient.getUserBalance(userId) + " ,  stawka kuponu wynosi: " + stake);
        }
        if(stake <= 0){
            throw new IllegalStateException("nie mozna postawic kuponu za kwote mniejsza lub rowna 0 ");
        }

        //postawienie kuponu
        Bet newBet = Bet.builder()
                .stake(stake)
                .totalOdd(coupon.getTotalOdd())
                .potentialPayout(coupon.getTotalOdd()*stake)
                .betStatus(BetStatus.PENDING)
                .userId(userId)
                .build();
        //zapisanie go w bazie
        Bet savedBet = betRepository.save(newBet);

        //zapisanie selekcji
        for (BetSelectionDto selectionDto : coupon.getSelections()) {

            Odd odd = oddRepository.findById(selectionDto.getOddId())
                    .orElseThrow(() -> new IllegalStateException("Kurs o ID " + selectionDto.getOddId() + " zniknął w trakcie obstawiania!"));

            Market market = marketRepository.findById(selectionDto.getMarketId())
                    .orElseThrow(() -> new IllegalStateException("Rynek o ID " + selectionDto.getMarketId() + " zniknął w trakcie obstawiania!"));

            BetSelection betSelection = BetSelection.builder()
                    .bet(savedBet)
                    .oddValueAtBetTime(selectionDto.getOddValue())
                    .selectionStatus(BetStatus.PENDING)
                    .odd(odd)
                    .market(market)
                    .build();

            betSelectionRepository.save(betSelection);
        }
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "bet.placed",
                new BetPlacedEvent(userId, savedBet.getBetId(), stake, LocalDateTime.now()));

        userClient.deductBalance(userId, stake);

        //transakcja
//        Transaction transaction = Transaction.builder()
//               // .user(user)
//                .transactionType(TransactionType.BET_PLACEMENT)
//                .amount(stake)
//                .relatedBet(savedBet)
//                .createdAt(LocalDateTime.now())
//                .build();
//
//        transactionRepository.save(transaction);

        couponService.clearCoupon(userId);

    };

    @Override
    @Transactional(readOnly = true)
    public List<BetHistoryDto> getUserBets(Long userId ,  String status){
        List<Bet> historyBets = betRepository.findByUserIdAndBetStatusOrderByCreatedAtDesc(userId , BetStatus.valueOf(status.toUpperCase()));

        return historyBets.stream().map(this::mapToMyBetDto).collect(Collectors.toList());
    }

    private BetHistoryDto mapToMyBetDto(Bet bet) {
        return BetHistoryDto.builder()
                .betId(bet.getBetId())
                .stake(bet.getStake())
                .totalOdd(bet.getTotalOdd())
                .potentialPayout(bet.getPotentialPayout())
                .status(bet.getBetStatus())
                .placedAt(bet.getCreatedAt())
                .selections(bet.getSelections().stream()
                        .map(this::mapToSelectionDto)
                        .collect(Collectors.toList()))
                .build();
    }
    private BetHistorySelectionDto mapToSelectionDto(BetSelection selection) {
        return BetHistorySelectionDto.builder()
                .eventName(selection.getOdd().getMarket().getEvent().getEventName())
                .marketName(selection.getOdd().getMarket().getMarketName())
                .outcomeName(selection.getOdd().getOutcomeName())
                .oddValue(selection.getOddValueAtBetTime())
                .status(selection.getSelectionStatus())
                .build();
    }


}
