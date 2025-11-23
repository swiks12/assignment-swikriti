import { useState } from "react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import "./MerchantFilters.css";

interface MerchantFiltersProps {
  onSearch: (filters: { searchName: string; searchId: string }) => void;
  onClear: () => void;
}

const MerchantFilters = ({ onSearch, onClear }: MerchantFiltersProps) => {
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");

  const handleSearch = () => {
    onSearch({ searchName, searchId });
  };

  const handleClearFilters = () => {
    setSearchName("");
    setSearchId("");
    onClear();
  };

  return (
    <div className="merchant-filters">
      <div className="merchant-filters-header">
        <h3 className="merchant-filters-title">🔍 Search Merchants</h3>
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
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Enter merchant or business name..."
          />
        </div>

        <div className="merchant-filter-item">
          <Input
            label="Search by ID"
            name="searchId"
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter merchant ID..."
          />
        </div>

        <div className="merchant-filter-item merchant-filter-button">
          <Button
            variant="primary"
            size="medium"
            onClick={handleSearch}
            className="merchant-search-btn"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MerchantFilters;
