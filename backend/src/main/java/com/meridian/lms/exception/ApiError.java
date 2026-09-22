package com.meridian.lms.exception;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;

/**
 * Standard error response shape for all API errors.

 * Matches the constructor signature used throughout GlobalExceptionHandler:
 *   new ApiError(int status, String error, String message, Instant timestamp)

 * Produces JSON:
 *   {
 *     "status": 400,
 *     "error": "Invalid path parameter",
 *     "message": "Parameter 'id' must be of type Long (got 'abc')",
 *     "timestamp": "2026-09-22T10:15:30.123Z"
 *   }
 */
public record ApiError(
        int status,
        String error,
        String message,
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant timestamp
) {}