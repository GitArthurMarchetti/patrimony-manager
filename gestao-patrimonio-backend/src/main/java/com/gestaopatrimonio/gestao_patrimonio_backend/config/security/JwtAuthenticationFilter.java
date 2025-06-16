package com.gestaopatrimonio.gestao_patrimonio_backend.config.security;

import com.gestaopatrimonio.gestao_patrimonio_backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
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

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        System.out.println("DEBUG: JwtAuthenticationFilter - Processing request for: " + request.getRequestURI());

        if(authHeader == null || !authHeader.startsWith("Bearer ")){
            System.out.println("DEBUG: JwtAuthenticationFilter - No Bearer token found in Authorization header.");
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        System.out.println("DEBUG: JwtAuthenticationFilter - JWT extracted: " + jwt.substring(0, Math.min(jwt.length(), 20)) + "..."); // Log parcial do JWT
        userEmail = jwtService.extractUsername(jwt);
        System.out.println("DEBUG: JwtAuthenticationFilter - Username extracted from JWT: " + userEmail);


        if(userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = null;
            try {
                userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                System.out.println("DEBUG: JwtAuthenticationFilter - UserDetails loaded for: " + userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)){
                    System.out.println("DEBUG: JwtAuthenticationFilter - Token is VALID for user: " + userEmail);
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
                    System.out.println("DEBUG: JwtAuthenticationFilter - SecurityContextHolder updated for: " + userEmail);
                } else {
                    System.err.println("ERROR: JwtAuthenticationFilter - Token NOT VALID for user: " + userEmail + " (might be expired or invalid signature)");
                }
            } catch (UsernameNotFoundException e) {
                System.err.println("ERROR: JwtAuthenticationFilter - User NOT FOUND in DB for username: " + userEmail + " - " + e.getMessage());
            } catch (Exception e) {
                System.err.println("FATAL ERROR: JwtAuthenticationFilter - Exception during token validation or user loading: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("DEBUG: JwtAuthenticationFilter - userEmail is null OR Authentication already exists: " + (userEmail == null ? "null" : userEmail) + " Auth context: " + SecurityContextHolder.getContext().getAuthentication());
        }

        filterChain.doFilter(request, response);
        System.out.println("DEBUG: JwtAuthenticationFilter - Filter chain continued.");
    }


    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/") || path.startsWith("/h2-console/") || path.startsWith("/auth/") || path.equals("/favicon.ico");
    }
}