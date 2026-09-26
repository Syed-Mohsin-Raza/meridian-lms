export type UserRole = "ADMIN" | "EMPLOYEE" | "CUSTOMER";

export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  creditScore: number;
  status: UserStatus;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: "Bearer";
  expiresInMs: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}
