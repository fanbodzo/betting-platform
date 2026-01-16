package org.example.client;

import org.example.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "odds-generator-service", url = "http://localhost:8082/api/v1/generator",configuration = FeignConfig.class)
public interface OddsGeneratorClient {

    @PostMapping("/predict")
    Map<String, Double> generateOdds(@RequestBody Map<String, String> request);
}