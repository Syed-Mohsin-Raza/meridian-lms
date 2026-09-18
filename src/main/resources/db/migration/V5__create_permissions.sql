-- V5__create_permissions.sql
-- Employee permissions (RBAC)

CREATE TABLE permissions (
                             id              BIGSERIAL PRIMARY KEY,
                             employee_id     BIGINT       NOT NULL,
                             permission      VARCHAR(50)  NOT NULL,
                             granted_by      BIGINT       NOT NULL,
                             granted_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

                             CONSTRAINT fk_permissions_employee
                                 FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
                             CONSTRAINT fk_permissions_granted_by
                                 FOREIGN KEY (granted_by) REFERENCES users(id),
                             CONSTRAINT uq_permissions_employee_permission
                                 UNIQUE (employee_id, permission),
                             CONSTRAINT chk_permissions_permission CHECK (
                                 permission IN (
                                                'manage_loans',
                                                'approve_loans',
                                                'manage_payments',
                                                'view_analytics',
                                                'manage_customers',
                                                'manage_employees'
                                     )
                                 )
);

CREATE INDEX idx_permissions_employee ON permissions(employee_id);