-- V6__seed_admin_user.sql
-- Seed a default admin user for development.
-- Password: Admin@1234 (BCrypt hash below is pre-computed with cost 12)

INSERT INTO users (email, password_hash, full_name, role, credit_score, status)
VALUES (
           'admin@lms.com',
           '$2a$12$4g5OESBWBgBdm1zaupLQreTL8nlaEBsr3df/.Q7BVyB3fRcWimIpy',
           'System Administrator',
           'ADMIN',
           850,
           'ACTIVE'
       );