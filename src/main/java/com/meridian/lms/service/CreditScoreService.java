package com.meridian.lms.service;

import com.meridian.lms.entity.User;
import com.meridian.lms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CreditScoreService {

    private static final Logger log = LoggerFactory.getLogger(CreditScoreService.class);

    public static final int MIN_SCORE = 300;
    public static final int MAX_SCORE = 850;

    // Score deltas from events
    public static final int DELTA_LOAN_APPROVED = 10;
    public static final int DELTA_PAYMENT_ON_TIME = 5;
    public static final int DELTA_PAYMENT_LATE = -10;
    public static final int DELTA_LOAN_REJECTED = -5;
    public static final int DELTA_LOAN_COMPLETED = 25;
    public static final int DELTA_LOAN_DEFAULTED = -50;

    private final UserRepository userRepository;

    public CreditScoreService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void applyDelta(User user, int delta, String reason) {
        int oldScore = user.getCreditScore();
        int newScore = clamp(oldScore + delta);
        user.setCreditScore(newScore);
        userRepository.save(user);
        log.info("Credit score updated for user {}: {} -> {} (delta={}, reason={})",
                user.getId(), oldScore, newScore, delta, reason);
    }

    private int clamp(int score) {
        return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
    }

    /**
     * Returns the interest rate adjustment (in percentage points) for a credit tier.
     * Excellent (750+): -2.0
     * Good      (700-749): -1.0
     * Fair      (650-699): 0.0
     * Poor      (600-649): +2.0
     * Bad       (<600): +4.0
     */
    public java.math.BigDecimal rateAdjustmentFor(int creditScore) {
        if (creditScore >= 750) return new java.math.BigDecimal("-2.00");
        if (creditScore >= 700) return new java.math.BigDecimal("-1.00");
        if (creditScore >= 650) return new java.math.BigDecimal("0.00");
        if (creditScore >= 600) return new java.math.BigDecimal("2.00");
        return new java.math.BigDecimal("4.00");
    }
}