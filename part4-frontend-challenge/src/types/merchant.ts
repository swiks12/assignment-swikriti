/**
 * Merchant Type Definitions
 */

export interface Merchant {
  merchantId: number;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  category: string;
  pan: string;
  createdAt?: string;
  updatedAt?: string;
  status?: "active" | "inactive";
}

export interface CreateMerchantRequest {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  category: string;
  pan: string;
  status?: string;
}

export interface CreateMerchantResponse {
  merchantId: number;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  category: string;
  pan: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantListResponse {
  data: Merchant[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MerchantFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: "active" | "inactive";
}
