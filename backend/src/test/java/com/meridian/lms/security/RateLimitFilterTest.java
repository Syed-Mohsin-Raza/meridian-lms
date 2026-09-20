package com.meridian.lms.security;

import com.meridian.lms.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@ActiveProfiles({"test", "rate-limit-test"})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class RateLimitFilterTest extends AbstractIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    private static final String LOGIN_BODY =
            "{\"email\":\"rate-limit-test@example.com\",\"password\":\"wrong\"}";

    @Test
    void login_exceedsRateLimit_returns429WithRetryAfter() throws Exception {
        String clientIp = "203.0.113.10";

        // First 3 requests pass through the filter (fail auth with 400/401)
        for (int i = 0; i < 3; i++) {
            final int iteration = i;
            mockMvc.perform(post("/api/v1/auth/login")
                            .header("X-Forwarded-For", clientIp)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(LOGIN_BODY))
                    .andExpect(result -> {
                        int responseStatus = result.getResponse().getStatus();
                        if (responseStatus == 429) {
                            throw new AssertionError(
                                    "Request " + (iteration + 1)
                                            + " was rate-limited too early (expected 400/401)");
                        }
                    });
        }

        // 4th request must be denied with 429 + Retry-After header
        mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Forwarded-For", clientIp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(LOGIN_BODY))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(header().string("Retry-After", "60"));
    }

    @Test
    void register_exceedsRateLimit_returns429() throws Exception {
        String clientIp = "203.0.113.11";

        String registerBodyTemplate = """
                {
                  "email": "rl-test-%d@example.com",
                  "password": "ValidPass123!",
                  "fullName": "Rate Limit Test",
                  "phone": "03001234567"
                }
                """;

        for (int i = 0; i < 3; i++) {
            final int iteration = i;
            mockMvc.perform(post("/api/v1/auth/register")
                            .header("X-Forwarded-For", clientIp)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(registerBodyTemplate.formatted(iteration)))
                    .andExpect(result -> {
                        int responseStatus = result.getResponse().getStatus();
                        if (responseStatus == 429) {
                            throw new AssertionError(
                                    "Request " + (iteration + 1) + " was rate-limited too early");
                        }
                    });
        }

        mockMvc.perform(post("/api/v1/auth/register")
                        .header("X-Forwarded-For", clientIp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBodyTemplate.formatted(99)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"));
    }
}