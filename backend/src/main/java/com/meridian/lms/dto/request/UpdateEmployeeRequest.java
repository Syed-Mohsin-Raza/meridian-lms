package com.meridian.lms.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmployeeRequest {

    @Size(min = 2, max = 255)
    private String fullName;

    @Size(max = 50)
    private String phone;
}