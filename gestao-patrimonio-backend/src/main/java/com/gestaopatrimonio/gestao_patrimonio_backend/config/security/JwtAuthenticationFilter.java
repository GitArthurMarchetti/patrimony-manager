package com.gestaopatrimonio.gestao_patrimonio_backend.config.security;

import com.gestaopatrimonio.gestao_patrimonio_backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull; // <--- Importar esta anotação
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,  // <--- ADICIONADO @NonNull
            @NonNull HttpServletResponse response, // <--- ADICIONADO @NonNull
            @NonNull FilterChain filterChain      // <--- ADICIONADO @NonNull
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        String userEmail = null;

        logger.debug("Processing request for: {}", request.getRequestURI());

        // Este bloco só será executado se shouldNotFilter() retornar false (ou seja, para rotas PROTEGIDAS)
        if(authHeader == null || !authHeader.startsWith("Bearer ")){
            logger.debug("No Bearer token found in Authorization header for protected path.");
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        logger.debug("JWT extracted: {}...", jwt.substring(0, Math.min(jwt.length(), 20)));

        try {
            userEmail = jwtService.extractUsername(jwt);
            logger.debug("Username extracted from JWT: {}", userEmail);

            if(userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                logger.debug("UserDetails loaded for: {}", userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)){
                    logger.debug("Token is VALID for user: {}", userEmail);
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("SecurityContextHolder updated for: {}", userEmail);
                } else {
                    logger.error("Token NOT VALID for user: {} (might be expired or invalid signature)", userEmail);
                }
            } else {
                logger.debug("userEmail is null OR Authentication already exists: {} Auth context: {}", (userEmail == null ? "null" : userEmail), SecurityContextHolder.getContext().getAuthentication());
            }
        } catch (UsernameNotFoundException e) {
            logger.error("User NOT FOUND in DB for username: {} - {}", userEmail, e.getMessage());
        } catch (Exception e) {
            logger.error("Exception during token validation or user loading (expected for invalid/expired tokens on protected paths): {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
        logger.debug("Filter chain continued.");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/") ||
                path.startsWith("/h2-console/") ||
                path.startsWith("/auth/") ||
                path.equals("/favicon.ico") ||
                path.equals("/error") ||
                path.startsWith("/web");
    }
}