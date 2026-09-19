-- V10__add_timestamps_to_audit_tables.sql
-- Envers includes @CreationTimestamp and @UpdateTimestamp fields in audit tables.
-- V9 omitted them; this migration adds the missing columns.

ALTER TABLE loans_aud
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE payments_aud
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
