package org.example.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    // userDetailsService nie potrzebujemy, bo nie mamy bazy!

    @Override
    public void doFilterInternal(HttpServletRequest request , HttpServletResponse response , FilterChain filterChain)
            throws ServletException, IOException {
        try {
            //proba wyuciagnicei ajwt z naglowak zadania
            String jwt = parseJwt(request);

            // jezlei token istnieje i jest poorawny
            if (jwt != null) {
                System.out.println("DEBUG: Znaleziono token w nagłówku: {}"+ jwt.substring(0, 10) + "...");

                if (jwtUtils.validateJwtToken(jwt)) {
                    System.out.println("DEBUG: Token jest poprawny! Loguję użytkownika...");

                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    System.out.println("DEBUG: Username z tokena: {}" + username);

                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(username, null, authorities);

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("DEBUG: Użytkownik {} pomyślnie zalogowany w SecurityContext." + username);
                } else {
                    System.out.println("DEBUG: Token jest NIEPOPRAWNY (walidacja nie przeszła)!");
                }
            } else {
                System.out.println("brak tokena w zadaniu");
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
        }


        //przkazanie zadnai dalejw lancuchu filtrow
        filterChain.doFilter(request, response);
    }

    //metoda pomocnicza do wyciagania tokenu z naglowwka "Authorization: Bearer <token>"
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }


}