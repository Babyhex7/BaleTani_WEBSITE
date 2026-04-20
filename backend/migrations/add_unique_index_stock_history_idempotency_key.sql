-- Add unique index to enforce idempotency for non-null idempotency_key
-- This prevents duplicate non-null idempotency keys (application-level idempotency)
ALTER TABLE `stock_history`
  ADD UNIQUE INDEX `uq_stock_history_idempotency_key` (`idempotency_key`);
