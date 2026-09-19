package com.meridian.lms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePermissionsRequest {

    @NotNull(message = "Permissions set is required (use empty set to revoke all)")
    private Set<String> permissions;
}