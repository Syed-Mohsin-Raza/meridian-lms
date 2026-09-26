package com.meridian.lms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "Meridian LMS",
                "timestamp", LocalDateTime.now().toString()
        );
    }

    @GetMapping("/debug/ping")
    public ResponseEntity<Map<String, Object>> debugPing(Authentication auth) {
        Map<String, Object> info = new HashMap<>();
        if (auth != null) {
            info.put("name", auth.getName());
            info.put("authorities", auth.getAuthorities().toString());
            info.put("principalType", auth.getPrincipal().getClass().getSimpleName());
        } else {
            info.put("auth", "null");
        }
        return ResponseEntity.ok(info);
    }
}