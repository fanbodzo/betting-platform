package org.example.client;

import org.example.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service", url = "http://localhost:8081/api/v1/users",configuration = FeignConfig.class)
public interface UserClient {

    @GetMapping("/{userId}/balance")
    Double getUserBalance(@PathVariable("userId") Long userId);

    @PostMapping("/{userId}/balance/deduct")
    void deductBalance(@PathVariable("userId") Long userId, @RequestParam("amount") Double amount);

    @PostMapping("/{userId}/balance/add")
    void addBalance(@PathVariable("userId") Long userId, @RequestParam("amount") Double amount);
}
