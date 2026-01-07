package org.example.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                String token = attributes.getRequest().getHeader("Authorization");
                System.out.println("FEIGN INTERCEPTOR: Token found: " + (token != null));
                if (token != null) {
                    requestTemplate.header("Authorization", token);
                }
            } else {
                System.out.println("FEIGN INTERCEPTOR: No attributes found!");
            }
        };
    }
}