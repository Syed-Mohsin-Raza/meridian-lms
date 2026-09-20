package com.meridian.lms;

import com.redis.testcontainers.RedisContainer;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

@SpringBootTest
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    /**
     * Singleton containers — started ONCE for the entire JVM.
     * Never stopped manually; Ryuk (Testcontainers) cleans them up on JVM exit.
     * This is the recommended pattern from Testcontainers docs:
     * <a href="https://java.testcontainers.org/test_framework_integration/manual_lifecycle_control/#singleton-containers">...</a>
     */
    static final PostgreSQLContainer<?> POSTGRES;
    static final RedisContainer REDIS;

    static {
        POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
                .withDatabaseName("loan_management_test")
                .withUsername("test_user")
                .withPassword("test_password");
        POSTGRES.start();

        REDIS = new RedisContainer(DockerImageName.parse("redis:7-alpine"));
        REDIS.start();
    }

    @DynamicPropertySource
    static void registerContainerProperties(DynamicPropertyRegistry registry) {
        // Postgres
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);

        // Redis — Spring Boot 3+/4 property names
        registry.add("spring.data.redis.host", REDIS::getHost);
        registry.add("spring.data.redis.port", () -> REDIS.getMappedPort(6379));
    }
}