import { useState } from "react";
import "./Merchants.css";
import { Button } from "../components/common/Button";
import MerchantForm from "@/components/merchants/MerchantForm";
import MerchantTable from "@/components/merchants/MerchantTable.tsx";

export const Merchants = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMerchantCreated = () => {
    // Trigger table refresh by incrementing the trigger
    setRefreshTrigger((prev) => prev + 1);
  };

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
          onClick={() => setIsModalOpen(true)}
          className="add-merchant-btn"
        >
          + Add New Merchant
        </Button>
      </div>
      <MerchantForm
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onMerchantCreated={handleMerchantCreated}
      />
      <MerchantTable key={refreshTrigger} />
    </main>
  );
};
