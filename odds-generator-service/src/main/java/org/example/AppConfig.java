package org.example;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
    @Bean
    public OddsGenerator oddsGenerator() {
        return new OddsGenerator("laLiga_model.json");
    }
}
