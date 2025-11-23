import { useState } from "react";
import { Input } from "../common/Input";
import "./MerchantFilters.css";

interface MerchantFiltersProps {
  onFilterChange: (filters: {
    searchName: string;
    searchId: string;
    sortBy: string;
  }) => void;
}

const MerchantFilters = ({ onFilterChange }: MerchantFiltersProps) => {
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchName(value);
    onFilterChange({ searchName: value, searchId, sortBy });
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchId(value);
    onFilterChange({ searchName, searchId: value, sortBy });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    onFilterChange({ searchName, searchId, sortBy: value });
  };

  const handleClearFilters = () => {
    setSearchName("");
    setSearchId("");
    setSortBy("name-asc");
    onFilterChange({ searchName: "", searchId: "", sortBy: "name-asc" });
  };

  return (
    <div className="merchant-filters">
      <div className="merchant-filters-header">
        <h3 className="merchant-filters-title">🔍 Filter & Sort</h3>
        <button
          className="merchant-filters-clear-btn"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
      </div>

      <div className="merchant-filters-grid">
        <div className="merchant-filter-item">
          <Input
            label="Search by Name"
            name="searchName"
            type="text"
            value={searchName}
            onChange={handleNameChange}
            placeholder="Enter merchant or business name..."
          />
        </div>

        <div className="merchant-filter-item">
          <Input
            label="Search by ID"
            name="searchId"
            type="text"
            value={searchId}
            onChange={handleIdChange}
            placeholder="Enter merchant ID..."
          />
        </div>

        <div className="merchant-filter-item">
          <label className="merchant-filter-label">Sort By</label>
          <select
            className="merchant-filter-select"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="id-asc">ID (Low to High)</option>
            <option value="id-desc">ID (High to Low)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default MerchantFilters;
