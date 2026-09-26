import type { UserStatus } from "./auth";

export interface Permission {
  id: number;
  code: string;
  description: string;
}

export interface Employee {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  status: UserStatus;
  permissions: string[];
  createdAt: string;
}

export interface CreateEmployeeRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  permissions?: string[];
}

export interface UpdateEmployeeRequest {
  fullName?: string;
  phone?: string;
}

export interface UpdatePermissionsRequest {
  permissions: string[];
}
