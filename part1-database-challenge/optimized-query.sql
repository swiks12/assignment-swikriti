SELECT
   tm.txn_id,
   tm.merchant_id,
   tm.gp_acquirer_id,
   tm.gp_issuer_id,
   tm.txn_date,
   tm.local_txn_date_time,
   tm.amount,
   tm.currency,
   tm.status,
   tm.card_type,
   tm.card_last4,
   tm.auth_code,
   tm.response_code,
   tm.created_at,
   tm.txn_id AS "tm.txnId",
   tm.local_txn_date_time AT TIME ZONE 'UTC' AS "tm.localTxnDateTime",
   -- Aggregate details in a single pass using LEFT JOIN + json_agg
   COALESCE(
      json_agg(
         json_build_object(
            'txn_detail_id', td.txn_detail_id,
            'master_txn_id', td.master_txn_id,
            'detail_type', td.detail_type,
            'amount', td.amount,
            'currency', td.currency,
            'description', td.description,
            'local_txn_date_time', td.local_txn_date_time,
            'converted_date', td.local_txn_date_time AT TIME ZONE 'UTC'
         ) ORDER BY td.local_txn_date_time DESC
      ) FILTER (WHERE td.txn_detail_id IS NOT NULL),
      '[]'::json
   ) AS details,
   ins.member_name AS member,
   iss.member_name AS issuer
FROM operators.transaction_master tm
   -- LEFT JOIN to get all details in one pass (not correlated subquery)
   LEFT JOIN operators.transaction_details td ON tm.txn_id = td.master_txn_id
   -- Member lookups remain as LEFT JOINs
   LEFT JOIN operators.members ins ON tm.gp_acquirer_id = ins.member_id
   LEFT JOIN operators.members iss ON tm.gp_issuer_id = iss.member_id
WHERE tm.txn_date > DATE '2025-11-16' 
   AND tm.txn_date < DATE '2025-11-18'
-- Leverage functional dependency: txn_id is PK, so only need to group by it
-- PostgreSQL automatically includes all tm.* columns when grouping by PK
GROUP BY tm.txn_id, ins.member_name, iss.member_name
ORDER BY tm.local_txn_date_time DESC;

-- ============================================================================
-- RECOMMENDED INDEXES FOR OPTIMAL PERFORMANCE
-- ============================================================================

-- Primary composite index for date range queries with sorting
-- Covers the WHERE clause and supports ORDER BY
CREATE INDEX IF NOT EXISTS idx_txn_master_date_time_optimized 
ON operators.transaction_master(txn_date, local_txn_date_time DESC);

-- Composite index for transaction_details to optimize joins
-- Includes local_txn_date_time for the ORDER BY in json_agg
CREATE INDEX IF NOT EXISTS idx_txn_details_master_with_time 
ON operators.transaction_details(master_txn_id, local_txn_date_time DESC);

-- Covering index if frequent filter by merchant_id as well
CREATE INDEX IF NOT EXISTS idx_txn_master_merchant_date_covering 
ON operators.transaction_master(merchant_id, txn_date) 
INCLUDE (local_txn_date_time, gp_acquirer_id, gp_issuer_id);

-- Member table is small (~500 rows), but if needed:
CREATE INDEX IF NOT EXISTS idx_members_member_name 
ON operators.members(member_id, member_name);

