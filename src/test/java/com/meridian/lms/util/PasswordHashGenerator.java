package com.meridian.lms.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {

    @Test
    void generateAdminHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        String hash = encoder.encode("Admin@1234");
        System.out.println("===========================================");
        System.out.println("ADMIN HASH: " + hash);
        System.out.println("===========================================");

        // Verify it works immediately
        boolean matches = encoder.matches("Admin@1234", hash);
        System.out.println("Verify matches: " + matches);
    }
}