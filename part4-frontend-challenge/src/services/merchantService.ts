import { get, post, put } from "./api";
import {
  Merchant,
  CreateMerchantRequest,
  CreateMerchantResponse,
  MerchantListResponse,
  MerchantFilters,
} from "../types/merchant";

/**
 * Merchant Service
 * Handles all merchant-related API calls
 */

const MERCHANT_BASE = "/merchants";

/**
 * Get all merchants with optional filters
 *
 * @param filters - Filter parameters (page, limit, search, category, status)
 * @returns Promise with merchant list response data
 */
export const getMerchants = async (
  filters?: MerchantFilters
): Promise<MerchantListResponse> => {
  const params = {
    page: filters?.page || 1,
    limit: filters?.limit || 10,
    ...(filters?.search && { search: filters.search }),
    ...(filters?.category && { category: filters.category }),
    ...(filters?.status && { status: filters.status }),
  };

  try {
    const response = await get<MerchantListResponse>(MERCHANT_BASE, { params });
    return response;
  } catch (error) {
    console.error("Error fetching merchants:", error);
    throw error;
  }
};

/**
 * Get a single merchant by ID
 *
 * @param merchantId - The merchant ID
 * @returns Promise with merchant data
 */
export const getMerchantById = async (
  merchantId: string
): Promise<Merchant> => {
  try {
    const response = await get<Merchant>(`${MERCHANT_BASE}/${merchantId}`);
    return response;
  } catch (error) {
    console.error("Error fetching merchant:", error);
    throw error;
  }
};

/**
 * Create a new merchant
 *
 * @param merchantData - The merchant data to create
 * @returns Promise with created merchant data
 */
export const createMerchant = async (
  merchantData: CreateMerchantRequest
): Promise<{ message: string; data: CreateMerchantResponse }> => {
  try {
    const response = await post<{
      message: string;
      data: CreateMerchantResponse;
    }>(MERCHANT_BASE, merchantData);
    return response;
  } catch (error) {
    console.error("Error creating merchant:", error);
    throw error;
  }
};

/**
 * Update an existing merchant
 *
 * @param merchantId - The merchant ID
 * @param merchantData - The merchant data to update
 * @returns Promise with updated merchant data
 */
export const updateMerchant = async (
  merchantId: string,
  merchantData: Partial<CreateMerchantRequest>
): Promise<{ message: string; data: Merchant }> => {
  try {
    const response = await put<{ message: string; data: Merchant }>(
      `${MERCHANT_BASE}/${merchantId}`,
      merchantData
    );
    return response;
  } catch (error) {
    console.error("Error updating merchant:", error);
    throw error;
  }
};

export default {
  getMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
};
