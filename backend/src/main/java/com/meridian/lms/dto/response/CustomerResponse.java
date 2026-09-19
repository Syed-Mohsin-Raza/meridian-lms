package com.meridian.lms.dto.response;

import com.meridian.lms.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private Integer creditScore;
    private String status;
    private LocalDateTime createdAt;

    public static CustomerResponse from(User user) {
        return CustomerResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .creditScore(user.getCreditScore())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}