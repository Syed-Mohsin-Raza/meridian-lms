-- V9__create_audit_tables.sql
-- Hibernate Envers audit tables for loans and payments.
-- Each row in *_aud represents a historical version of the entity.
-- The pair (id, rev) uniquely identifies a historical version.

-- Revision info table, one row per transaction that touched an audited entity
CREATE TABLE revinfo (
                         rev         BIGSERIAL PRIMARY KEY,
                         revtstmp    BIGINT       NOT NULL,
                         actor_id    BIGINT,
                         actor_email VARCHAR(255)
);

CREATE INDEX idx_revinfo_timestamp ON revinfo(revtstmp);

-- Audit table for loans
CREATE TABLE loans_aud (
                           id                  BIGINT       NOT NULL,
                           rev                 BIGINT       NOT NULL,
                           revtype             SMALLINT     NOT NULL,  -- 0=INSERT, 1=UPDATE, 2=DELETE
                           customer_id         BIGINT,
                           loan_type_id        BIGINT,
                           assigned_employee_id BIGINT,
                           amount              NUMERIC(19,4),
                           term_months         INTEGER,
                           interest_rate       NUMERIC(5,2),
                           monthly_payment     NUMERIC(19,4),
                           total_payable       NUMERIC(19,4),
                           total_interest      NUMERIC(19,4),
                           outstanding_balance NUMERIC(19,4),
                           status              VARCHAR(50),
                           purpose             TEXT,
                           rejection_reason    TEXT,
                           applied_at          TIMESTAMP,
                           reviewed_at         TIMESTAMP,
                           approved_at         TIMESTAMP,
                           completed_at        TIMESTAMP,
                           updated_at          TIMESTAMP,
                           PRIMARY KEY (id, rev),
                           CONSTRAINT fk_loans_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE INDEX idx_loans_aud_id ON loans_aud(id);
CREATE INDEX idx_loans_aud_rev ON loans_aud(rev);

-- Audit table for payments
CREATE TABLE payments_aud (
                              id                  BIGINT       NOT NULL,
                              rev                 BIGINT       NOT NULL,
                              revtype             SMALLINT     NOT NULL,
                              loan_id             BIGINT,
                              customer_id         BIGINT,
                              amount              NUMERIC(19,4),
                              principal_portion   NUMERIC(19,4),
                              interest_portion    NUMERIC(19,4),
                              due_date            DATE,
                              paid_at             TIMESTAMP,
                              status              VARCHAR(50),
                              payment_method      VARCHAR(50),
                              late_fee            NUMERIC(19,4),
                              installment_number  INTEGER,
                              idempotency_key     VARCHAR(100),
                              PRIMARY KEY (id, rev),
                              CONSTRAINT fk_payments_aud_rev FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE INDEX idx_payments_aud_id ON payments_aud(id);
CREATE INDEX idx_payments_aud_rev ON payments_aud(rev);