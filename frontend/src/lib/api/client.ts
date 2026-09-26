import { tokenStore } from "@/lib/auth/token";
import type { ApiError, ValidationError } from "@/types/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly error: string,
    message: string,
    public readonly fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiClientError";
  }

  isValidationError(): boolean {
    return this.status === 400 && this.fieldErrors !== undefined;
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip the Authorization header. Used for login/register. */
  skipAuth?: boolean;
}

/**
 * Thin wrapper around fetch that handles:
 * - JSON serialization
 * - JWT injection
 * - Error normalization into ApiClientError
 * - Query parameter serialization
 *
 * Why not axios: native fetch is standard, smaller bundle, no extra types.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, skipAuth = false, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...((headers as Record<string, string>) ?? {}),
  };

  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (!skipAuth) {
    const token = tokenStore.get();
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content — no body to parse
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // Normalize Spring's two error shapes: ApiError and ValidationError
    if (typeof payload === "object" && payload !== null) {
      const err = payload as ApiError | ValidationError;

      if ("fieldErrors" in err && err.fieldErrors) {
        throw new ApiClientError(
          response.status,
          "Validation failed",
          "One or more fields are invalid",
          err.fieldErrors
        );
      }

      if ("error" in err && "message" in err) {
        throw new ApiClientError(response.status, err.error, err.message);
      }
    }

    // Fallback for non-JSON errors
    throw new ApiClientError(
      response.status,
      response.statusText || "Request failed",
      typeof payload === "string" ? payload : "Request failed"
    );
  }

  return payload as T;
}

/**
 * Build a query string from an object. Skips null/undefined values.
 * Arrays are repeated as multiple entries (Spring's default for List<T>).
 */
export function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
