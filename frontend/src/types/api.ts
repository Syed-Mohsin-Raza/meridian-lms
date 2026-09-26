/**
 * Spring Page<T> response envelope for paginated endpoints.
 * Matches org.springframework.data.domain.Page serialization.
 */
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

/**
 * Standard error body produced by GlobalExceptionHandler.
 * Note: Spring returns this shape for 4xx/5xx responses.
 */
export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}

/**
 * Field-level validation errors from MethodArgumentNotValidException.
 * Spring returns this shape when @Valid fails on request bodies.
 */
export interface ValidationError {
  status: number;
  message: string;
  fieldErrors: Record<string, string>;
  timestamp: string;
}

export type ApiResponse<T> = T | ApiError | ValidationError;

/**
 * Type guard: does this response represent an API error?
 */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "error" in value &&
    "message" in value
  );
}

export function isValidationError(value: unknown): value is ValidationError {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "fieldErrors" in value
  );
}
