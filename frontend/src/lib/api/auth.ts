import { apiRequest } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth";

export const authApi = {
  login(payload: LoginRequest): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  register(payload: RegisterRequest): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  me(): Promise<User> {
    return apiRequest<User>("/api/v1/auth/me");
  },
};
