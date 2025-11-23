import { useState } from "react";
import "./Merchants.css";
import { Button } from "../components/common/Button";
import MerchantForm from "@/components/merchants/MerchantForm";

export const Merchants = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            <MerchantForm isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        </main>
    );
};
