package com.meridian.lms;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    /**
     * Singleton container — started ONCE for the entire JVM.
     * Never stopped manually; Ryuk (Testcontainers) cleans it up on JVM exit.
     * This is the recommended pattern from Testcontainers docs:
     * <a href="https://java.testcontainers.org/test_framework_integration/manual_lifecycle_control/#singleton-containers">...</a>
     */
    static final PostgreSQLContainer<?> POSTGRES;

    static {
        POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
                .withDatabaseName("loan_management_test")
                .withUsername("test_user")
                .withPassword("test_password");
        POSTGRES.start();   // start IMMEDIATELY at class load
    }

    @DynamicPropertySource
    static void registerPgProperties(DynamicPropertyRegistry registry) {
        // The SAME URL is returned every time because the container is a singleton
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }
}