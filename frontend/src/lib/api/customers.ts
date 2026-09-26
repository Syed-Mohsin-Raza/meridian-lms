import { apiRequest, buildQuery } from "./client";
import type { Customer, CustomerFilter } from "@/types/customer";
import type { Page } from "@/types/api";

export const customersApi = {
  list(filter: CustomerFilter = {}): Promise<Page<Customer>> {
    const qs = buildQuery({
      status: filter.status,
      search: filter.search,
      page: filter.page ?? 0,
      size: filter.size ?? 20,
      sort: filter.sort ?? "createdAt,desc",
    });
    return apiRequest<Page<Customer>>(`/api/v1/customers${qs}`);
  },

  getById(id: number): Promise<Customer> {
    return apiRequest<Customer>(`/api/v1/customers/${id}`);
  },

  suspend(id: number): Promise<Customer> {
    return apiRequest<Customer>(`/api/v1/customers/${id}/suspend`, {
      method: "PUT",
    });
  },

  activate(id: number): Promise<Customer> {
    return apiRequest<Customer>(`/api/v1/customers/${id}/activate`, {
      method: "PUT",
    });
  },
};
