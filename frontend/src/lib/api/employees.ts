import { apiRequest, buildQuery } from "./client";
import type {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
  UpdatePermissionsRequest,
} from "@/types/employee";
import type { Page } from "@/types/api";

export const employeesApi = {
  list(page = 0, size = 20): Promise<Page<Employee>> {
    const qs = buildQuery({ page, size, sort: "createdAt,desc" });
    return apiRequest<Page<Employee>>(`/api/v1/employees${qs}`);
  },

  getById(id: number): Promise<Employee> {
    return apiRequest<Employee>(`/api/v1/employees/${id}`);
  },

  create(payload: CreateEmployeeRequest): Promise<Employee> {
    return apiRequest<Employee>("/api/v1/employees", {
      method: "POST",
      body: payload,
    });
  },

  update(id: number, payload: UpdateEmployeeRequest): Promise<Employee> {
    return apiRequest<Employee>(`/api/v1/employees/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  updatePermissions(
    id: number,
    payload: UpdatePermissionsRequest
  ): Promise<Employee> {
    return apiRequest<Employee>(`/api/v1/employees/${id}/permissions`, {
      method: "PUT",
      body: payload,
    });
  },

  deactivate(id: number): Promise<void> {
    return apiRequest<void>(`/api/v1/employees/${id}`, {
      method: "DELETE",
    });
  },
};
