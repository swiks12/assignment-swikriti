import { useState, useEffect } from "react";
import {
  getMerchants,
  createMerchant,
  searchMerchants,
} from "../services/merchantService";
import {
  Merchant,
  CreateMerchantRequest,
  MerchantFilters,
} from "../types/merchant";

interface UseMerchantsResult {
  merchants: Merchant[];
  loading: boolean;
  error: Error | null;
  totalPages: number;
  currentPage: number;
  totalItems: number;
  refetch: () => void;
  createNewMerchant: (merchantData: CreateMerchantRequest) => Promise<void>;
  creating: boolean;
  createError: Error | null;
  search: (searchParams: {
    searchName?: string;
    searchId?: string;
    page?: number;
  }) => Promise<void>;
}

/**
 * Custom hook for managing merchants
 *
 * @param filters - Optional filters for merchant list
 * @returns Merchant data, loading state, and CRUD operations
 */
export const useMerchants = (filters?: MerchantFilters): UseMerchantsResult => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(filters?.page || 1);
  const [totalItems, setTotalItems] = useState(0);

  // State for create operation
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<Error | null>(null);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMerchants(filters);
      setMerchants(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
      setTotalItems(response.totalItems);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching merchants:", err);
    } finally {
      setLoading(false);
    }
  };

  const createNewMerchant = async (merchantData: CreateMerchantRequest) => {
    try {
      setCreating(true);
      setCreateError(null);
      const newMerchant = await createMerchant(merchantData);
      console.log("Merchant created successfully:", newMerchant);

      // Refetch merchants to show the new one
      await fetchMerchants();
    } catch (err) {
      setCreateError(err as Error);
      console.error("Error creating merchant:", err);
      throw err; // Re-throw to allow form to handle it
    } finally {
      setCreating(false);
    }
  };

  const search = async (searchParams: {
    searchName?: string;
    searchId?: string;
    page?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await searchMerchants({
        searchName: searchParams.searchName,
        searchId: searchParams.searchId,
        page: searchParams.page || 1,
        limit: filters?.limit || 10,
      });
      setMerchants(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
      setTotalItems(response.totalItems);
    } catch (err) {
      setError(err as Error);
      console.error("Error searching merchants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, [
    filters?.page,
    filters?.limit,
    filters?.search,
    filters?.category,
    filters?.status,
  ]);

  return {
    merchants,
    loading,
    error,
    totalPages,
    currentPage,
    totalItems,
    refetch: fetchMerchants,
    createNewMerchant,
    creating,
    createError,
    search,
  };
};
