-- V3__create_loans.sql
-- Loan applications and their lifecycle

CREATE TABLE loans (
                       id                  BIGSERIAL PRIMARY KEY,
                       customer_id         BIGINT        NOT NULL,
                       loan_type_id        BIGINT        NOT NULL,
                       assigned_employee_id BIGINT,
                       amount              NUMERIC(19,4) NOT NULL,
                       term_months         INTEGER       NOT NULL,
                       interest_rate       NUMERIC(5,2)  NOT NULL,
                       monthly_payment     NUMERIC(19,4) NOT NULL,
                       total_payable       NUMERIC(19,4) NOT NULL,
                       total_interest      NUMERIC(19,4) NOT NULL,
                       outstanding_balance NUMERIC(19,4) NOT NULL,
                       status              VARCHAR(50)   NOT NULL DEFAULT 'PENDING',
                       purpose             TEXT,
                       rejection_reason    TEXT,
                       applied_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       reviewed_at         TIMESTAMP,
                       approved_at         TIMESTAMP,
                       completed_at        TIMESTAMP,
                       updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       version             BIGINT        NOT NULL DEFAULT 0,

                       CONSTRAINT fk_loans_customer
                           FOREIGN KEY (customer_id) REFERENCES users(id),
                       CONSTRAINT fk_loans_loan_type
                           FOREIGN KEY (loan_type_id) REFERENCES loan_types(id),
                       CONSTRAINT fk_loans_employee
                           FOREIGN KEY (assigned_employee_id) REFERENCES users(id),
                       CONSTRAINT chk_loans_amount CHECK (amount > 0),
                       CONSTRAINT chk_loans_term CHECK (term_months > 0),
                       CONSTRAINT chk_loans_rate CHECK (interest_rate >= 0 AND interest_rate <= 100),
                       CONSTRAINT chk_loans_status CHECK (
                           status IN ('PENDING','UNDER_REVIEW','APPROVED','REJECTED','ACTIVE','COMPLETED','DEFAULTED')
                           ),
                       CONSTRAINT chk_loans_balance CHECK (outstanding_balance >= 0)
);

CREATE INDEX idx_loans_customer ON loans(customer_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_loan_type ON loans(loan_type_id);
CREATE INDEX idx_loans_assigned_employee ON loans(assigned_employee_id);
CREATE INDEX idx_loans_applied_at ON loans(applied_at DESC);

-- Composite index for common admin queries
CREATE INDEX idx_loans_status_applied ON loans(status, applied_at DESC);