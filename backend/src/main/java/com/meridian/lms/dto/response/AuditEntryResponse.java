package com.meridian.lms.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEntryResponse {
    private Long revisionId;
    private String revisionType;
    private LocalDateTime timestamp;
    private String actorEmail;
    private Object snapshot;
}