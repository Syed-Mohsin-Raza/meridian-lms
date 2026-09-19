package com.meridian.lms.dto.response;

import com.meridian.lms.entity.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String status;
    private Set<String> permissions;
    private LocalDateTime createdAt;

    public static EmployeeResponse from(User user, Set<String> permissions) {
        return EmployeeResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .status(user.getStatus().name())
                .permissions(permissions)
                .createdAt(user.getCreatedAt())
                .build();
    }
}