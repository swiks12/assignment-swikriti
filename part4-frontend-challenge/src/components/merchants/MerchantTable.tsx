import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../common/Table";
import { useMerchants } from "../../hooks/useMerchants";
import { searchMerchants } from "../../services/merchantService";
import MerchantFilters from "./MerchantFilters";
import "./MerchantTable.css";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { Merchant } from "../../types/merchant";

const MerchantTable = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortBy, setSortBy] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState<Merchant[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<Error | null>(null);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchTotalItems, setSearchTotalItems] = useState(0);
  const [activeSearchFilters, setActiveSearchFilters] = useState({
    searchName: "",
    searchId: "",
  });

  // Fetch merchants using the custom hook (for initial load and non-search mode)
  const { merchants, loading, error, totalPages, totalItems } = useMerchants({
    page: currentPage,
    limit: itemsPerPage,
  });

  // Handle search
  const handleSearch = async (filters: {
    searchName: string;
    searchId: string;
  }) => {
    // If both filters are empty, switch back to regular mode
    if (!filters.searchName.trim() && !filters.searchId.trim()) {
      setIsSearchMode(false);
      setCurrentPage(1);
      return;
    }

    setIsSearchMode(true);
    setSearchLoading(true);
    setSearchError(null);
    setActiveSearchFilters(filters);
    setCurrentPage(1);

    try {
      const response = await searchMerchants({
        searchName: filters.searchName,
        searchId: filters.searchId,
        page: 1,
        limit: itemsPerPage,
      });

      setSearchResults(response.data);
      setSearchTotalPages(response.totalPages);
      setSearchTotalItems(response.totalItems);
    } catch (err) {
      setSearchError(err as Error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setIsSearchMode(false);
    setSearchResults([]);
    setActiveSearchFilters({ searchName: "", searchId: "" });
    setCurrentPage(1);
  };

  // Handle search pagination
  const handleSearchPageChange = async (page: number) => {
    if (!isSearchMode) return;

    setSearchLoading(true);
    setSearchError(null);

    try {
      const response = await searchMerchants({
        searchName: activeSearchFilters.searchName,
        searchId: activeSearchFilters.searchId,
        page: page,
        limit: itemsPerPage,
      });

      setSearchResults(response.data);
      setSearchTotalPages(response.totalPages);
      setSearchTotalItems(response.totalItems);
      setCurrentPage(page);
    } catch (err) {
      setSearchError(err as Error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Determine which data source to use
  const currentMerchants = isSearchMode ? searchResults : merchants;
  const currentLoading = isSearchMode ? searchLoading : loading;
  const currentError = isSearchMode ? searchError : error;
  const currentTotalPages = isSearchMode ? searchTotalPages : totalPages;
  const currentTotalItems = isSearchMode ? searchTotalItems : totalItems;

  // Sort merchants
  const sortedMerchants = useMemo(() => {
    const sorted = [...currentMerchants];

    sorted.sort((a, b) => {
      switch (sortBy) {
        
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "id-asc":
          return a.merchantId - b.merchantId;
        case "id-desc":
          return b.merchantId - a.merchantId;
        default:
          return 0;
      }
    });

    return sorted;
  }, [currentMerchants, sortBy]);

  const handlePreviousPage = () => {
    const newPage = Math.max(currentPage - 1, 1);
    if (isSearchMode) {
      handleSearchPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const handleNextPage = () => {
    const newPage = Math.min(currentPage + 1, currentTotalPages);
    if (isSearchMode) {
      handleSearchPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    if (isSearchMode) {
      handleSearchPageChange(pageNumber);
    } else {
      setCurrentPage(pageNumber);
    }
  };

  const handleRowClick = (merchantId: number) => {
    navigate(`/merchants/update/${merchantId}`);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (currentTotalPages <= maxPagesToShow) {
      for (let i = 1; i <= currentTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(currentTotalPages);
      } else if (currentPage >= currentTotalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = currentTotalPages - 3; i <= currentTotalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(currentTotalPages);
      }
    }

    return pages;
  };

  return (
    <>
      <MerchantFilters onSearch={handleSearch} onClear={handleClearFilters} />

      {/* Sorting Controls */}
      <div className="merchant-table-controls">
        <div className="merchant-sort-section">
          <label className="merchant-sort-label">Sort By:</label>
          <select
            className="merchant-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="id-asc">ID (Low to High)</option>
            <option value="id-desc">ID (High to Low)</option>
          </select>
        </div>
      </div>

      <div className="merchant-table-container">
        {currentLoading && (
          <div className="merchant-table-loading">
            <LoadingSpinner />
          </div>
        )}

        {currentError && (
          <div className="merchant-table-error">
            Error loading merchants: {currentError.message}
          </div>
        )}

        {!currentLoading && !currentError && (
          <>
            <div className="merchant-table-wrapper">
              <Table>
                <thead>
                  <tr>
                    <th>Merchant ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Business Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>PAN</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMerchants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="merchant-table-empty">
                        No merchants found. Try adjusting your filters!
                      </td>
                    </tr>
                  ) : (
                    sortedMerchants.map((merchant) => (
                      <tr
                        key={merchant.merchantId}
                        onClick={() => handleRowClick(merchant.merchantId)}
                        className="merchant-table-row-clickable"
                      >
                        <td className="merchant-table-cell-id">
                          {merchant.merchantId}
                        </td>
                        <td className="merchant-table-cell-name">
                          {merchant.name}
                        </td>
                        <td className="merchant-table-cell-email">
                          {merchant.email}
                        </td>
                        <td className="merchant-table-cell-phone">
                          {merchant.phone}
                        </td>
                        <td className="merchant-table-cell-business">
                          {merchant.businessName}
                        </td>
                        <td className="merchant-table-cell-category">
                          <span className="merchant-category-badge">
                            {merchant.category}
                          </span>
                        </td>
                        <td className="merchant-table-cell-status">
                          <span
                            className={`merchant-status-badge merchant-status-${
                              merchant.status || "active"
                            }`}
                          >
                            {merchant.status || "active"}
                          </span>
                        </td>
                        <td className="merchant-table-cell-pan">
                          {merchant.pan}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            {sortedMerchants.length > 0 && currentTotalPages > 1 && (
              <div className="merchant-pagination">
                <div className="merchant-pagination-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, currentTotalItems)} of{" "}
                  {currentTotalItems} records
                </div>

                <div className="merchant-pagination-controls">
                  <button
                    className="merchant-pagination-btn merchant-pagination-prev"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <div className="merchant-pagination-numbers">
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        className={`merchant-pagination-number ${
                          page === currentPage
                            ? "merchant-pagination-active"
                            : ""
                        } ${
                          page === "..." ? "merchant-pagination-ellipsis" : ""
                        }`}
                        onClick={() =>
                          typeof page === "number" && handlePageClick(page)
                        }
                        disabled={page === "..."}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    className="merchant-pagination-btn merchant-pagination-next"
                    onClick={handleNextPage}
                    disabled={currentPage === currentTotalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MerchantTable;
