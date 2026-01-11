package org.example;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.cors.reactive.CorsUtils;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Konfiguracja globalnych zasad CORS dla całego API Gateway.
 * Ten filtr jest kluczowy do obsługi zapytań "preflight" (OPTIONS)
 * wysyłanych przez przeglądarki, gdy frontend (np. React na localhost:3000)
 * próbuje komunikować się z backendem na innym porcie/domenie.
 */
@Configuration
public class CorsConfig
{

    // Lista nagłówków, które frontend może wysyłać w żądaniach.
    // Musi zawierać 'Authorization' dla tokenów JWT.
    private static final String ALLOWED_HEADERS = "x-requested-with, authorization, Content-Type, Content-Length, Authorization, credential, X-XSRF-TOKEN";

    // Lista metod HTTP, które są dozwolone.
    private static final String ALLOWED_METHODS = "GET, PUT, POST, DELETE, OPTIONS, PATCH";

    // Adres, z którego frontend będzie wysyłał żądania.
    // ZMIEŃ TEN ADRES, JEŚLI TWÓJ FRONTEND DZIAŁA NA INNYM PORCIE!
    private static final String ALLOWED_ORIGIN = "http://localhost:5173";

    // Czas (w sekundach), przez jaki przeglądarka może cache'ować wynik zapytania preflight.
    private static final String MAX_AGE = "7200"; // 2 godziny

    @Bean
    public WebFilter corsFilter() {
        return (ServerWebExchange ctx, WebFilterChain chain) -> {
            ServerHttpRequest request = ctx.getRequest();
            ServerHttpResponse response = ctx.getResponse();

            HttpHeaders headers = response.getHeaders();
            headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
            headers.set("Vary", "Origin");
            headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
            headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
            headers.set("Access-Control-Max-Age", MAX_AGE);
            // Jeśli używasz cookies: wtedy też to dodaj i origin NIE może być "*"
            // headers.set("Access-Control-Allow-Credentials", "true");

            if (CorsUtils.isPreFlightRequest(request)) {
                response.setStatusCode(HttpStatus.NO_CONTENT); // 204
                return Mono.empty();
            }

            return chain.filter(ctx);
        };
    }
}