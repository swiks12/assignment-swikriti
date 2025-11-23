import { useState } from 'react';
import { FilterState, DEFAULT_FILTERS } from '../types/transaction';
import { TransactionList } from '../components/common/TransactionList';
import { TransactionSummary } from '../components/common/TransactionSummary';
import { useTransactions } from '../hooks/useTransactions';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * Transactions Page Component
 * Displays transaction dashboard with summary and list
 */
export const Transactions = () => {
  const merchantId = import.meta.env.VITE_DEFAULT_MERCHANT_ID || 'MCH-00001';
  const [filters] = useState<FilterState>(DEFAULT_FILTERS);

  const { data, loading, error } = useTransactions(merchantId, filters);

  return (
    <main className="container">
      <h1>Transaction Dashboard</h1>
      <p className="subtitle">Merchant: {merchantId}</p>

      {/* TODO: Add TransactionFilters component */}
      <div className="filters-section">
        <p style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', color: '#92400e' }}>
          🔧 TODO: Implement TransactionFilters component (date range, status filter)
        </p>
      </div>

      {error && (
        <div className="error-message" style={{ padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#991b1b', margin: '1rem 0' }}>
          Error loading transactions: {error.message}
        </div>
      )}

      {loading && !data && (
        <div className="loading-message" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          <LoadingSpinner/>
        </div>
      )}

      {data && (
        <>
          <div className="summary-section">
            <TransactionSummary 
              transactions={data.transactions || []} 
              totalTransactions={data.totalTransactions || 0}
            />
          </div>

          <div className="transactions-section">
            <TransactionList 
              transactions={data.transactions || []} 
              loading={loading}
            />
          </div>

          {/* TODO: Add Pagination component */}
          <div className="pagination-section" style={{ padding: '1rem', marginTop: '1rem', background: '#fef3c7', borderRadius: '8px', color: '#92400e' }}>
            <p>🔧 TODO: Implement Pagination component (showing page {data.page + 1}, {data.totalTransactions} total transactions)</p>
          </div>
        </>
      )}
    </main>
  );
};
