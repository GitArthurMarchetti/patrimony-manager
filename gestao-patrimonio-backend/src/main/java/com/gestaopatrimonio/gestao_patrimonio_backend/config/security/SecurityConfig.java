package com.gestaopatrimonio.gestao_patrimonio_backend.config.security;

import com.gestaopatrimonio.gestao_patrimonio_backend.service.UserDetailsServiceImpl;
import com.gestaopatrimonio.gestao_patrimonio_backend.config.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, UserDetailsServiceImpl userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // Permitir acesso a endpoints de autenticação e outros recursos públicos
                        .requestMatchers("/api/auth/**", "/h2-console/**", "/auth/**", "/favicon.ico", "/error", "/web/**").permitAll()
                        // Todas as outras requisições exigem autenticação
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Configura as origens permitidas para requisições CORS
        // Inclui localhost para desenvolvimento, a URL do frontend na Vercel
        // e a URL do seu backend no Elastic Beanstalk (opcional, mas boa prática)
        config.setAllowedOrigins(List.of(
                "http://localhost:3000", // Para o ambiente de desenvolvimento local do frontend
                "https://patrimony-manager-avfp-k95vj0pbh-arthurs-projects-fceb2ed4.vercel.app", // A URL COMPLETA DO SEU FRONTEND NA VERCEL
                "http://gestao-patrimonio-backend-env.us-east-2.elasticbeanstalk.com" // A URL do seu próprio backend no Elastic Beanstalk
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Métodos HTTP permitidos
        config.setAllowedHeaders(List.of("*")); // Permite todos os headers nas requisições CORS
        config.setAllowCredentials(true); // Permite o envio de cookies e headers de autorização
        source.registerCorsConfiguration("/**", config); // Aplica esta configuração CORS a todos os caminhos
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Define o encoder de senha a ser usado (BCrypt para segurança)
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        // Configura o provedor de autenticação com o UserDetailsService e o PasswordEncoder
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        // Expõe o AuthenticationManager para ser injetado onde for necessário (e.g., AuthController)
        return authenticationConfiguration.getAuthenticationManager();
    }
}