package org.example.client;

import lombok.extern.slf4j.Slf4j;
import org.example.config.RabbitMQConfig;
import org.example.dto.event.UserRegisteredEvent;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class UserEventListener {
    @RabbitListener(queues = RabbitMQConfig.USER_REGISTERED_QUEUE_NAME)
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Odebrano zdarzenie! Nowy uzytkownik: {} (ID: {})", event.username(), event.userId());
    }
}

