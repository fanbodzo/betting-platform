package org.example.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.Entity.Transaction;
import org.example.Entity.TransactionType;
import org.example.Entity.User;
import org.example.config.RabbitMQConfig;
import org.example.dto.event.BetPlacedEvent;
import org.example.dto.event.BetSettledEvent;
import org.example.repository.TransactionRepository;
import org.example.repository.UserRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionEventListener {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    //obsluga postawnia zakladu logujemy transakcje bo wczeniej byla w betSERviceimpl
    @RabbitListener(queues = RabbitMQConfig.BET_PLACED_QUEUE_NAME)
    @Transactional
    public void handleBetPlaced(BetPlacedEvent event) {
        log.info("Odebrano zdarzenie BET_PLACED: betId={}, amount={}", event.betId(), event.amount());

        User user = userRepository.findById(event.userId())
                .orElseThrow(() -> new RuntimeException("User not found for transaction"));

        Transaction transaction = Transaction.builder()
                .user(user)
                .transactionType(TransactionType.BET_PLACEMENT)
                .amount(event.amount())
                .relatedBetId(event.betId())
                .createdAt(event.occurredAt())
                .build();

        transactionRepository.save(transaction);
        log.info("Zapisano transakcję BET_PLACEMENT");
    }

    //oblsuga wygranej
    @RabbitListener(queues = RabbitMQConfig.BET_SETTLED_QUEUE_NAME)
    @Transactional
    public void handleBetSettled(BetSettledEvent event) {
        log.info("Odebrano zdarzenie BET_SETTLED: betId={}, status={}", event.betId(), event.status());

        if ("WON".equals(event.status())) {
            User user = userRepository.findById(event.userId())
                    .orElseThrow(() -> new RuntimeException("User not found for transaction"));

            Transaction transaction = Transaction.builder()
                    .user(user)
                    .transactionType(TransactionType.BET_WINNING)
                    .amount(event.payoutAmount())
                    .relatedBetId(event.betId())
                    .createdAt(event.occurredAt())
                    .build();

            transactionRepository.save(transaction);
            log.info("Zapisano transakcję BET_WINNING");
        }
    }
}