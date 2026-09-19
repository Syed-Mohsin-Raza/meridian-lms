package com.meridian.lms.service;

import com.meridian.lms.audit.AuditRevisionEntity;
import com.meridian.lms.entity.Loan;
import com.meridian.lms.entity.Payment;
import com.meridian.lms.exception.NotFoundException;
import jakarta.persistence.EntityManager;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuditService {

    private final EntityManager entityManager;

    public AuditService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public List<AuditEntry<Loan>> loanHistory(Long loanId) {
        return loadHistory(Loan.class, loanId);
    }

    @Transactional(readOnly = true)
    public List<AuditEntry<Payment>> paymentHistory(Long paymentId) {
        return loadHistory(Payment.class, paymentId);
    }

    @SuppressWarnings("unchecked")
    private <T> List<AuditEntry<T>> loadHistory(Class<T> entityClass, Long entityId) {
        AuditReader reader = AuditReaderFactory.get(entityManager);

        // Verify the entity has at least one revision — avoids empty confusion
        List<Number> revisions = reader.getRevisions(entityClass, entityId);
        if (revisions.isEmpty()) {
            throw new NotFoundException("No audit history found for " + entityClass.getSimpleName() + " id=" + entityId);
        }

        List<Object[]> results = reader.createQuery()
                .forRevisionsOfEntity(entityClass, false, true)
                .add(AuditEntity.id().eq(entityId))
                .addOrder(AuditEntity.revisionNumber().asc())
                .getResultList();

        List<AuditEntry<T>> entries = new ArrayList<>();
        for (Object[] row : results) {
            T entity = (T) row[0];
            AuditRevisionEntity rev = (AuditRevisionEntity) row[1];
            RevisionType revType = (RevisionType) row[2];

            entries.add(new AuditEntry<>(
                    entity,
                    rev.getId(),
                    revType.name(),
                    LocalDateTime.ofInstant(
                            Instant.ofEpochMilli(rev.getTimestamp()),
                            ZoneId.systemDefault()
                    ),
                    rev.getActorEmail()
            ));
        }
        return entries;
    }

    public record AuditEntry<T>(
            T entity,
            Long revisionId,
            String revisionType,
            LocalDateTime timestamp,
            String actorEmail
    ) {}
}