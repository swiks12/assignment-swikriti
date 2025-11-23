import { useState, useMemo } from "react";
import { Table } from "../common/Table";
import { useMerchants } from "../../hooks/useMerchants";
import MerchantFilters from "./MerchantFilters";
import "./MerchantTable.css";
import { LoadingSpinner } from "../common/LoadingSpinner";

const MerchantTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    searchName: "",
    searchId: "",
    sortBy: "latest",
  });

  // Fetch merchants using the custom hook
  const { merchants, loading, error, totalPages, totalItems } = useMerchants({
    page: currentPage,
    limit: itemsPerPage,
  });

  // Filter and sort merchants
  const filteredAndSortedMerchants = useMemo(() => {
    let filtered = [...merchants];

    // Filter by name (searches both name and business name)
    if (filters.searchName) {
      const searchLower = filters.searchName.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchLower) ||
          m.businessName.toLowerCase().includes(searchLower)
      );
    }

    // Filter by ID
    if (filters.searchId) {
      filtered = filtered.filter((m) =>
        m.merchantId.toString().includes(filters.searchId)
      );
    }

    // Sort merchants
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "latest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
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

    return filtered;
  }, [merchants, filters]);

  const handleFilterChange = (newFilters: {
    searchName: string;
    searchId: string;
    sortBy: string;
  }) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
      <MerchantFilters onFilterChange={handleFilterChange} />

      <div className="merchant-table-container">
        {loading && (
          <div className="merchant-table-loading"><LoadingSpinner/></div>
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
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedMerchants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="merchant-table-empty">
                        No merchants found. Try adjusting your filters!
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedMerchants.map((merchant) => (
                      <tr key={merchant.merchantId}>
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
            {filteredAndSortedMerchants.length > 0 && totalPages > 1 && (
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
