-- V4__create_payments.sql
-- Payment records and schedules

CREATE TABLE payments (
                          id                  BIGSERIAL PRIMARY KEY,
                          loan_id             BIGINT        NOT NULL,
                          customer_id         BIGINT        NOT NULL,
                          amount              NUMERIC(19,4) NOT NULL,
                          principal_portion   NUMERIC(19,4) NOT NULL,
                          interest_portion    NUMERIC(19,4) NOT NULL,
                          due_date            DATE          NOT NULL,
                          paid_at             TIMESTAMP,
                          status              VARCHAR(50)   NOT NULL DEFAULT 'PENDING',
                          payment_method      VARCHAR(50),
                          late_fee            NUMERIC(19,4) NOT NULL DEFAULT 0,
                          installment_number  INTEGER       NOT NULL,
                          idempotency_key     VARCHAR(100)  UNIQUE,
                          created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          version             BIGINT        NOT NULL DEFAULT 0,

                          CONSTRAINT fk_payments_loan
                              FOREIGN KEY (loan_id) REFERENCES loans(id),
                          CONSTRAINT fk_payments_customer
                              FOREIGN KEY (customer_id) REFERENCES users(id),
                          CONSTRAINT chk_payments_amount CHECK (amount > 0),
                          CONSTRAINT chk_payments_principal CHECK (principal_portion >= 0),
                          CONSTRAINT chk_payments_interest CHECK (interest_portion >= 0),
                          CONSTRAINT chk_payments_late_fee CHECK (late_fee >= 0),
                          CONSTRAINT chk_payments_status CHECK (
                              status IN ('PENDING','PAID','OVERDUE','PARTIAL')
                              ),
                          CONSTRAINT chk_payments_installment CHECK (installment_number > 0)
);

CREATE INDEX idx_payments_loan ON payments(loan_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_idempotency ON payments(idempotency_key);

-- Composite for "what's due for this loan, sorted"
CREATE INDEX idx_payments_loan_installment ON payments(loan_id, installment_number);