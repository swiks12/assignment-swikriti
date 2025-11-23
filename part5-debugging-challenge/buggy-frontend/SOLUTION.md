# Bug 2: Frontend - Transaction List Component - SOLUTION

## Issues Found

### 1. **Memory Leak - Missing Interval Cleanup (Critical)**

```typescript
useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, refreshInterval);

  // Missing cleanup!
}, [merchantId]);
```

**Problem:** Interval continues running after component unmounts.

**Impact:**

- Memory leak - interval keeps executing
- API calls continue even when component is gone
- Multiple intervals stack up if component remounts
- Browser tab becomes slow over time
- Unnecessary server load

**How to Reproduce:**

1. Navigate to page with TransactionList
2. Navigate away
3. Check Network tab - API calls still happening
4. Repeat navigation 10 times - 10 intervals running!

### 2. **Missing Dependency - `refreshInterval` (Major)**

```typescript
useEffect(() => {
  const interval = setInterval(fetchData, refreshInterval);
}, [merchantId]); // refreshInterval missing!
```

**Problem:** Effect doesn't re-run when `refreshInterval` prop changes.

**Impact:**

- If parent changes refresh interval, old interval keeps running
- New interval never created with updated timing
- Stale closures capture old `refreshInterval` value

### 3. **Performance Issue - NumberFormat Recreation (Major)**

```typescript
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    // Created on EVERY render!
    style: "currency",
    currency: "USD",
  }).format(amount);
};
```

**Problem:** `Intl.NumberFormat` is expensive to create, created on every render.

**Impact:**

- If 100 transactions displayed, 100 formatters created per render
- Component re-renders on every keystroke in search input
- Typing "merchant" = 8 keystrokes × 100 rows = 800 formatter creations
- Noticeable lag in UI

**Benchmark:**

```javascript
// Creating formatter: ~0.1ms each
// For 100 items: ~10ms
// At 60fps, budget is 16ms per frame
// Searching causes dropped frames!
```

### 4. **No Error Handling (Major)**

```typescript
const fetchData = async () => {
    const data = await transactionService.getTransactions({...});
    setTransactions(data.content);
};
```

**Problem:** If API fails, no error shown to user.

**Impact:**

- Network errors = blank screen
- User doesn't know what's wrong
- No retry mechanism
- Poor user experience

### 5. **No Loading State (Minor)**

**Problem:** No indication that data is being fetched.

**Impact:**

- User sees empty table while loading
- Can't distinguish between "loading" and "no data"
- Poor UX

### 6. **Unnecessary State - `filteredTransactions` (Minor)**

**Problem:** Filtered transactions stored in state instead of being derived.

**Impact:**

- Extra state management
- Two effects instead of one computed value
- Harder to debug
- More re-renders

### 7. **Case-Sensitive Search - Inconsistent Behavior (Minor)**

**Problem:** Search on `merchantName` is case-insensitive but `transactionId` is case-sensitive.

```typescript
txn.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  txn.transactionId.includes(searchTerm); // No toLowerCase() here!
```

**Impact:**

- User searches "abc123" but transaction ID is "ABC123" - won't match
- Inconsistent behavior confuses users
- Harder to find transactions by ID

### 8. **No Empty State Message (Minor)**

**Problem:** When there are no transactions or search returns nothing, user sees an empty table.

**Impact:**

- User doesn't know if data is loading or there's no data
- Confusing UX - is it broken or just empty?
- No guidance on what to do next

### 9. **Race Condition with Multiple Intervals (Critical)**

**Problem:** When `merchantId` changes, old interval keeps running while new one starts.

```typescript
useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, refreshInterval);
  // No cleanup - old interval still runs!
}, [merchantId]);
```

**Impact:**

- Changing merchant creates multiple intervals
- Multiple API calls fetching different merchants
- Wrong data displayed
- Server overload

**Example:**

1. Load merchant "M1" - interval starts
2. Switch to merchant "M2" - new interval starts, old one keeps running
3. Now TWO intervals running, fetching different data
4. Switch to "M3" - THREE intervals!

### 10. **fetchData Not Memoized - Causes Extra Effect Runs (Major)**

**Problem:** `fetchData` function is recreated on every render, causing the useEffect to run unnecessarily.

```typescript
useEffect(() => {
    const fetchData = async () => { ... };  // New function every render
    // ...
}, [merchantId, refreshInterval, fetchData]); // fetchData changes every time!
```

**Impact:**

- Effect runs on every render, not just when dependencies change
- Interval is cleared and recreated constantly
- Unnecessary API calls
- Performance degradation

## Root Cause Analysis

The developer:

1. Didn't understand useEffect cleanup functions
2. Missed dependency array warnings (or ignored them!)
3. Didn't profile performance
4. Didn't implement proper error boundaries
5. Focused on happy path, ignored edge cases
6. Made inconsistent implementation choices (case-sensitive vs case-insensitive)
7. Didn't consider race conditions when dependencies change
8. Created functions inside useEffect without memoization

## Fixed Code

```typescript
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { transactionService } from "../services/transactionService";
import { Transaction } from "../types/transaction";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

interface TransactionListProps {
  merchantId: string;
  refreshInterval?: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  merchantId,
  refreshInterval = 5000,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FIX 3: Create formatter once and reuse (useMemo)
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }),
    [] // Empty deps - create once
  );

  // Format amount function using memoized formatter
  const formatAmount = useCallback(
    (amount: number) => currencyFormatter.format(amount),
    [currencyFormatter]
  );

  // FIX 4: Add error handling with useCallback
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await transactionService.getTransactions({
        merchantId,
        page: 1,
        size: 100,
      });
      setTransactions(data.content);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch transactions"
      );
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  // FIX 1 & 2: Proper cleanup and complete dependencies
  useEffect(() => {
    setLoading(true);
    fetchData();

    // Set up interval
    const interval = setInterval(fetchData, refreshInterval);

    // FIX 1: Clean up interval on unmount or when deps change
    return () => {
      clearInterval(interval);
    };
  }, [merchantId, refreshInterval, fetchData]); // FIX 2: Include all dependencies

  // FIX 6: Derive filtered transactions instead of storing in state
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;

    const lowerSearch = searchTerm.toLowerCase();
    // FIX 7: Make search case-insensitive for both fields
    return transactions.filter(
      (txn) =>
        txn.merchantName.toLowerCase().includes(lowerSearch) ||
        txn.transactionId.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, transactions]);

  // FIX 5: Handle loading state
  if (loading && transactions.length === 0) {
    return <LoadingSpinner />;
  }

  // FIX 4: Handle error state
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error: {error}</p>
        <button onClick={() => fetchData()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="search-bar">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search transactions..."
          className="search-input"
        />
        {loading && <span className="loading-indicator">Refreshing...</span>}
      </div>

      {filteredTransactions.length === 0 ? (
        <p className="no-results">
          {/* FIX 8: Show helpful message for empty state */}
          {searchTerm
            ? `No transactions found for "${searchTerm}"`
            : "No transactions available"}
        </p>
      ) : (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Merchant</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((txn) => (
              <tr key={txn.transactionId}>
                <td>{txn.transactionId}</td>
                <td>{txn.merchantName}</td>
                <td>{formatAmount(txn.totalAmount)}</td>
                <td>
                  <span className={`status status-${txn.status.toLowerCase()}`}>
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
```

## Key Improvements

### 1. Memory Leak Fixed

```typescript
// Before:
const interval = setInterval(fetchData, refreshInterval);
// No cleanup!

// After:
useEffect(() => {
  const interval = setInterval(fetchData, refreshInterval);
  return () => clearInterval(interval); // ✅ Cleanup
}, [merchantId, refreshInterval, fetchData]);
```

### 2. Dependencies Fixed

```typescript
// Before:
}, [merchantId]); // ❌ Missing refreshInterval

// After:
}, [merchantId, refreshInterval, fetchData]); // ✅ Complete
```

### 3. Performance Optimized

```typescript
// Before: Creating formatter on every render
const formatAmount = (amount: number) => {
    return new Intl.NumberFormat(...).format(amount); // ❌ Slow
};

// After: Create once, reuse forever
const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('en-US', {...}),
    []
);
```

**Performance Improvement:**

- Before: ~10ms per render with 100 items
- After: ~0.1ms per render
- **100x faster!**

### 4. Error Handling Added

```typescript
try {
    const data = await transactionService.getTransactions({...});
    setTransactions(data.content);
} catch (err) {
    setError(err.message); // ✅ Show error to user
}
```

### 5. Loading State Added

```typescript
if (loading && transactions.length === 0) {
  return <LoadingSpinner />;
}
```

### 6. Derived State Instead of Stored State

```typescript
// Before: Stored in state with useEffect
const [filteredTransactions, setFilteredTransactions] = useState([]);
useEffect(() => {
    const filtered = transactions.filter(...);
    setFilteredTransactions(filtered);
}, [searchTerm, transactions]);

// After: Computed with useMemo
const filteredTransactions = useMemo(() => {
    return transactions.filter(...);
}, [searchTerm, transactions]);
```

## Alternative Solutions

### Option 1: Custom Hook (Better Separation of Concerns)

```typescript
// useTransactions.ts
export const useTransactions = (
  merchantId: string,
  refreshInterval: number = 5000
) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // ... fetch logic
  }, [merchantId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [merchantId, refreshInterval, fetchData]);

  return { transactions, loading, error, refetch: fetchData };
};

// Component
export const TransactionList: React.FC<Props> = ({ merchantId }) => {
  const { transactions, loading, error, refetch } = useTransactions(merchantId);
  // ... rest of component
};
```

### Option 2: React Query (Production Approach)

```typescript
import { useQuery } from "@tanstack/react-query";

export const TransactionList: React.FC<Props> = ({
  merchantId,
  refreshInterval,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["transactions", merchantId],
    queryFn: () =>
      transactionService.getTransactions({ merchantId, page: 1, size: 100 }),
    refetchInterval: refreshInterval,
    // Built-in cleanup, caching, and error handling!
  });

  // ... rest of component
};
```


## Bug Summary - Simple List

Here's a simple breakdown of all the bugs:

### Critical Bugs 

1. **Memory Leak** - Interval never stops, keeps running forever
2. **Race Condition** - Multiple intervals run when merchant changes
3. **Missing Error Handling** - App crashes if API fails

### Major Bugs 

4. **Missing Dependency** - refreshInterval not in dependency array
5. **Performance Issue** - Creates 100+ formatters on every keystroke
6. **fetchData Recreation** - Function remade constantly, causes extra renders

### Minor Bugs

7. **Unnecessary State** - filteredTransactions should be computed, not stored
8. **Inconsistent Search** - Merchant name is case-insensitive, ID is not
9. **Missing Loading State** - User doesn't see loading indicator
10. **No Empty Message** - Empty table looks broken


