import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../common/Table";
import { useMerchants } from "../../hooks/useMerchants";
import MerchantFilters from "./MerchantFilters";
import "./MerchantTable.css";
import { LoadingSpinner } from "../common/LoadingSpinner";

const MerchantTable = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortBy, setSortBy] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [activeSearchFilters, setActiveSearchFilters] = useState({
    searchName: "",
    searchId: "",
  });

  // Fetch merchants using the custom hook
  const { merchants, loading, error, totalPages, totalItems, search, refetch } =
    useMerchants({
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
      refetch();
      return;
    }

    setIsSearchMode(true);
    setActiveSearchFilters(filters);
    setCurrentPage(1);

    await search({
      searchName: filters.searchName,
      searchId: filters.searchId,
      page: 1,
    });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setIsSearchMode(false);
    setActiveSearchFilters({ searchName: "", searchId: "" });
    setCurrentPage(1);
    refetch();
  };

  // Handle search pagination
  const handleSearchPageChange = async (page: number) => {
    if (!isSearchMode) return;

    setCurrentPage(page);
    await search({
      searchName: activeSearchFilters.searchName,
      searchId: activeSearchFilters.searchId,
      page: page,
    });
  };

  // Sort merchants
  const sortedMerchants = useMemo(() => {
    const sorted = [...merchants];

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
  }, [merchants, sortBy]);

  const handlePreviousPage = () => {
    const newPage = Math.max(currentPage - 1, 1);
    if (isSearchMode) {
      handleSearchPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const handleNextPage = () => {
    const newPage = Math.min(currentPage + 1, totalPages);
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

  const handleViewDetails = (e: React.MouseEvent, merchantId: number) => {
    e.stopPropagation(); // Prevent row click from firing
    navigate(`/merchants/${merchantId}`);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
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
        {loading && (
          <div className="merchant-table-loading">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="merchant-table-error">
            Error loading merchants: {error.message}
          </div>
        )}

        {!loading && !error && (
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMerchants.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="merchant-table-empty">
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
                        <td className="merchant-table-cell-actions">
                          <button
                            className="merchant-view-details-btn"
                            onClick={(e) =>
                              handleViewDetails(e, merchant.merchantId)
                            }
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            {sortedMerchants.length > 0 && totalPages > 1 && (
              <div className="merchant-pagination">
                <div className="merchant-pagination-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} records
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
                    disabled={currentPage === totalPages}
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
