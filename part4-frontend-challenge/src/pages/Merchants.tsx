import "./Merchants.css";
import { Button } from "../components/common/Button";

export const Merchants = () => {
  return (
    <main className="merchants-page">
      <div className="merchants-header-container">
        <div className="merchants-header-content">
          <h1>🏢 Merchants Management</h1>
          <p className="subtitle">Manage merchant accounts and settings</p>
        </div>
        <Button
          variant="primary"
          size="medium"
          className="add-merchant-btn"
        >
        + Add New Merchant
        </Button>
      </div>
    </main>
  );
};
