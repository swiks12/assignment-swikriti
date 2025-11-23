import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMerchantById } from "../services/merchantService";
import { getTransactions } from "../services/transactionService";
import { Merchant } from "../types/merchant";
import { Transaction } from "../types/transaction";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import "./MerchantDetails.css";

export const MerchantDetails = () => {
  const { id } = useParams<{ id: string }>();
//   const  id  ='MCH-00001';
  const navigate = useNavigate();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transaction statistics
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    const fetchMerchantDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch merchant data
        const merchantData = await getMerchantById(id);
        setMerchant(merchantData);

        // Fetch transactions
        try {
          const transactionData = await getTransactions(id, {
            page: 0,
            size: 10,
            startDate: "",
            endDate: "",
            status: undefined,
          });

          if (transactionData && transactionData.transactions) {
            setTransactions(transactionData.transactions);

            // Calculate statistics
            const completed = transactionData.transactions.filter(
              (t) => t.status === "completed"
            ).length;
            const pending = transactionData.transactions.filter(
              (t) => t.status === "pending"
            ).length;
            const failed = transactionData.transactions.filter(
              (t) => t.status === "failed"
            ).length;
            const totalAmount = transactionData.transactions.reduce(
              (sum, t) => sum + t.amount,
              0
            );

            setStats({
              total: transactionData.transactions.length,
              completed,
              pending,
              failed,
              totalAmount,
            });
          }
        } catch (txnError) {
          console.log("No transactions available for this merchant");
          setTransactions([]);
        }
      } catch (err) {
        console.error("Error fetching merchant details:", err);
        setError("Failed to load merchant details");
      } finally {
        setLoading(false);
      }
    };

    fetchMerchantDetails();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExportTransactions = () => {
    if (transactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    // Create CSV content
    const headers = [
      "Transaction ID",
      "Amount",
      "Currency",
      "Status",
      "Date",
      "Card Type",
    ];
    const rows = transactions.map((txn) => [
      txn.txnId,
      txn.amount,
      txn.currency,
      txn.status,
      txn.timestamp,
      txn.cardType,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `merchant-${id}-transactions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="merchant-details-loading">
        <LoadingSpinner />
        <p>Loading merchant details...</p>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="merchant-details-error">
        <h2>Error</h2>
        <p>{error || "Merchant not found"}</p>
        <Button onClick={() => navigate("/merchants")}>
          Back to Merchants
        </Button>
      </div>
    );
  }

  return (
    <div className="merchant-details-page">
      <div className="merchant-details-header">
        <div className="header-left">
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate("/merchants")}
          >
            ← Back
          </Button>
          <h2>🔍 Merchant Details</h2>
        </div>
        <div className="header-right">
          <Button
            variant="secondary"
            size="medium"
            onClick={() => navigate(`/merchants/update/${id}`)}
            style={{ backgroundColor: "#2424a3" }}
          >
            ✏️ Edit Merchant
          </Button>
        </div>
      </div>

      {/* Merchant Profile Card */}
      <Card className="merchant-profile-card">
        <h2>📋 Complete Merchant Profile</h2>
        <div className="profile-grid">
          <div className="profile-item">
            <span className="label">Merchant ID:</span>
            <span className="value">{merchant.merchantId}</span>
          </div>
          <div className="profile-item">
            <span className="label">Name:</span>
            <span className="value">{merchant.name}</span>
          </div>
          <div className="profile-item">
            <span className="label">Business Name:</span>
            <span className="value">{merchant.businessName}</span>
          </div>
          <div className="profile-item">
            <span className="label">Email:</span>
            <span className="value">{merchant.email}</span>
          </div>
          <div className="profile-item">
            <span className="label">Phone:</span>
            <span className="value">{merchant.phone}</span>
          </div>
          <div className="profile-item">
            <span className="label">Category:</span>
            <span className="value">
              <span className="category-badge">{merchant.category}</span>
            </span>
          </div>
          <div className="profile-item">
            <span className="label">PAN:</span>
            <span className="value">{merchant.pan}</span>
          </div>
          <div className="profile-item">
            <span className="label">Status:</span>
            <span className="value">
              <span className={`status-badge status-${merchant.status}`}>
                {merchant.status}
              </span>
            </span>
          </div>
          <div className="profile-item">
            <span className="label">Created:</span>
            <span className="value">
              {merchant.createdAt ? formatDate(merchant.createdAt) : "N/A"}
            </span>
          </div>
          <div className="profile-item">
            <span className="label">Last Updated:</span>
            <span className="value">
              {merchant.updatedAt ? formatDate(merchant.updatedAt) : "N/A"}
            </span>
          </div>
        </div>
      </Card>

      {/* Transaction Statistics Card */}
      <Card className="transaction-stats-card">
        <h2>📊 Transaction Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item stat-total">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
          <div className="stat-item stat-completed">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-item stat-pending">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-item stat-failed">
            <div className="stat-value">{stats.failed}</div>
            <div className="stat-label">Failed</div>
          </div>
          <div className="stat-item stat-amount">
            <div className="stat-value">
              {formatCurrency(stats.totalAmount)}
            </div>
            <div className="stat-label">Total Amount</div>
          </div>
        </div>
      </Card>

      {/* Recent Transactions Card */}
      <Card className="recent-transactions-card">
        <div className="card-header-with-action">
          <h2>📝 Recent Transactions</h2>
          <Button
            variant="secondary"
            size="small"
            onClick={handleExportTransactions}
            disabled={transactions.length === 0}
            style={{ backgroundColor: "#2424a3" }}
          >
            📥 Export CSV
          </Button>
        </div>

        {transactions.length === 0 ? (
          <div className="no-transactions">
            <p>No transactions found for this merchant</p>
          </div>
        ) : (
          <div className="transactions-table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Status</th>
                  <th>Card</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.txnId}>
                    <td>#{txn.txnId}</td>
                    <td className="amount">{formatCurrency(txn.amount)}</td>
                    <td>{txn.currency}</td>
                    <td>
                      <span className={`status-badge status-${txn.status}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td>
                      {txn.cardType} ****{txn.cardLast4}
                    </td>
                    <td className="date">{formatDate(txn.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Activity Timeline Card */}
      <Card className="activity-timeline-card">
        <h2>⏱️ Merchant Activity Timeline</h2>
        <div className="timeline">
          {merchant.updatedAt && (
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-time">
                  {formatDate(merchant.updatedAt)}
                </div>
                <div className="timeline-title">Profile Updated</div>
                <div className="timeline-desc">
                  Merchant information was last updated
                </div>
              </div>
            </div>
          )}
          {transactions.slice(0, 3).map((txn) => (
            <div key={txn.txnId} className="timeline-item">
              <div className={`timeline-dot timeline-dot-${txn.status}`}></div>
              <div className="timeline-content">
                <div className="timeline-time">{formatDate(txn.timestamp)}</div>
                <div className="timeline-title">
                  Transaction {txn.status} - {formatCurrency(txn.amount)}
                </div>
                <div className="timeline-desc">
                  {txn.cardType} card ending in {txn.cardLast4}
                </div>
              </div>
            </div>
          ))}
          {merchant.createdAt && (
            <div className="timeline-item">
              <div className="timeline-dot timeline-dot-created"></div>
              <div className="timeline-content">
                <div className="timeline-time">
                  {formatDate(merchant.createdAt)}
                </div>
                <div className="timeline-title">Merchant Created</div>
                <div className="timeline-desc">
                  Merchant account was registered in the system
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
