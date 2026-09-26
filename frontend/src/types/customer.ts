import type { UserStatus } from "./auth";

/**
 * Customer is a User with role CUSTOMER plus aggregate metrics.
 * The backend's CustomerResponse returns this shape.
 */

export interface Customer {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  creditScore: number;
  status: UserStatus;
  createdAt: string;
}

export interface CustomerFilter {
  status?: UserStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}
