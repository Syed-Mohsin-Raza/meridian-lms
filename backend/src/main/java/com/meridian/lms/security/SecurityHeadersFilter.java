package com.meridian.lms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Adds defense-in-depth security headers to every response.
 *
 * These are complementary to Spring Security's defaults:
 * - Spring Security already sets Cache-Control, X-Frame-Options (via headers()),
 *   X-Content-Type-Options.
 * - This filter adds headers Spring Security doesn't set by default:
 *   Referrer-Policy, Permissions-Policy, and a Content-Security-Policy.

 * CSP is permissive because Swagger UI requires inline scripts and CDN resources.
 * For a pure JSON API this is fine — the CSP primarily protects the /swagger-ui.html
 * page.
 */
@Component
@Order(0)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

        // CSP permits Swagger UI's inline scripts. Tighten for production
        // if Swagger is disabled (springdoc.api-docs.enabled=false).
        response.setHeader("Content-Security-Policy",
                "default-src 'self'; " +
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                        "style-src 'self' 'unsafe-inline'; " +
                        "img-src 'self' data:; " +
                        "font-src 'self' data:; " +
                        "connect-src 'self'; " +
                        "frame-ancestors 'none'; " +
                        "base-uri 'self'; " +
                        "form-action 'self'");

        filterChain.doFilter(request, response);
    }
}