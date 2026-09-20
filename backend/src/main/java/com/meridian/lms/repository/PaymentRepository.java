package com.meridian.lms.repository;

import com.meridian.lms.entity.Payment;
import com.meridian.lms.entity.Loan;
import com.meridian.lms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByLoanOrderByInstallmentNumberAsc(Loan loan);

    Optional<Payment> findByIdempotencyKey(String idempotencyKey);

    List<Payment> findByLoanAndStatus(Loan loan, Payment.PaymentStatus status);

    List<Payment> findByCustomer(User customer);

    @Query(value = """
    SELECT TO_CHAR(paid_at, 'YYYY-MM') AS period,
           COALESCE(SUM(interest_portion), 0) AS interest_revenue,
           COALESCE(SUM(late_fee), 0) AS late_fees
    FROM payments
    WHERE status = 'PAID' AND paid_at >= :since
    GROUP BY period
    ORDER BY period
    """, nativeQuery = true)
    List<Object[]> monthlyRevenue(@Param("since") java.time.LocalDateTime since);

    @Query("SELECT COALESCE(SUM(p.interestPortion), 0) FROM Payment p WHERE p.status = 'PAID'")
    java.math.BigDecimal sumInterestRevenue();

    @Query("SELECT COALESCE(SUM(p.lateFee), 0) FROM Payment p WHERE p.status = 'PAID'")
    java.math.BigDecimal sumLateFees();
}