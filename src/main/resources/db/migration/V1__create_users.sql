-- V1__create_users.sql
-- Initial users table for Meridian LMS

CREATE TABLE users (
                       id              BIGSERIAL PRIMARY KEY,
                       email           VARCHAR(255) NOT NULL UNIQUE,
                       password_hash   VARCHAR(255) NOT NULL,
                       full_name       VARCHAR(255) NOT NULL,
                       phone           VARCHAR(50),
                       role            VARCHAR(50)  NOT NULL DEFAULT 'CUSTOMER',
                       credit_score    INTEGER      NOT NULL DEFAULT 650,
                       status          VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
                       created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       version         BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Constraint: credit score must be in valid range
ALTER TABLE users
    ADD CONSTRAINT chk_credit_score_range
        CHECK (credit_score >= 300 AND credit_score <= 850);