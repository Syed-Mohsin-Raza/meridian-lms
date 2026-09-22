package com.meridian.lms.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meridian.lms.AbstractIntegrationTest;
import com.meridian.lms.dto.request.LoginRequest;
import com.meridian.lms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
class LoanControllerTest extends AbstractIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String adminToken;

    @BeforeEach
    void loginAsAdmin() throws Exception {
        LoginRequest login = LoginRequest.builder()
                .email("admin@lms.com")
                .password("Admin@1234")
                .build();

        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andReturn().getResponse().getContentAsString();

        JsonNode node = objectMapper.readTree(response);
        JsonNode tokenNode = node.get("token");
        if (tokenNode == null || tokenNode.isNull()) {
            throw new IllegalStateException(
                    "Admin login failed. Response: " + response
                            + ". Likely the admin seed user was deleted by another test's @BeforeEach cleanup.");
        }
        adminToken = tokenNode.asText();
    }

    @Test
    void getLoanById_nonNumericId_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/loans/abc")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(
                        org.hamcrest.Matchers.containsString("must be of type Long")));
    }

    @Test
    void getLoanById_nonExistentId_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/loans/999999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }
}