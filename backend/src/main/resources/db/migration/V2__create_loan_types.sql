-- V2__create_loan_types.sql
-- Loan products offered by the platform

CREATE TABLE loan_types (
                            id                  BIGSERIAL PRIMARY KEY,
                            code                VARCHAR(50)   NOT NULL UNIQUE,
                            name                VARCHAR(100)  NOT NULL,
                            description         TEXT,
                            min_amount          NUMERIC(19,4) NOT NULL,
                            max_amount          NUMERIC(19,4) NOT NULL,
                            min_term_months     INTEGER       NOT NULL,
                            max_term_months     INTEGER       NOT NULL,
                            base_interest_rate  NUMERIC(5,2)  NOT NULL,
                            active              BOOLEAN       NOT NULL DEFAULT TRUE,
                            created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

                            CONSTRAINT chk_loan_type_amounts
                                CHECK (min_amount > 0 AND max_amount >= min_amount),
                            CONSTRAINT chk_loan_type_terms
                                CHECK (min_term_months > 0 AND max_term_months >= min_term_months),
                            CONSTRAINT chk_loan_type_rate
                                CHECK (base_interest_rate >= 0 AND base_interest_rate <= 100)
);

CREATE INDEX idx_loan_types_active ON loan_types(active);
CREATE INDEX idx_loan_types_code ON loan_types(code);