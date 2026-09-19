-- V7__seed_loan_types.sql
-- Standard loan products offered by Meridian

INSERT INTO loan_types (code, name, description, min_amount, max_amount, min_term_months, max_term_months, base_interest_rate, active)
VALUES
        ('PERSONAL', 'Personal Loan',
        'Unsecured personal loan for any purpose. Fast approval, no collateral required.',
        1000.0000, 50000.0000, 6, 60, 12.50, TRUE),

        ('AUTO', 'Auto Loan',
         'Secured vehicle financing. Lower rates with the vehicle as collateral.',
         5000.0000, 150000.0000, 12, 84, 8.75, TRUE),

        ('HOME', 'Home Loan',
         'Long-term mortgage for home purchase or refinancing. Best rates with property collateral.',
         50000.0000, 2000000.0000, 60, 360, 6.25, TRUE),

        ('BUSINESS', 'Business Loan',
         'Working capital or expansion financing for registered businesses.',
         10000.0000, 500000.0000, 12, 120, 10.00, TRUE);