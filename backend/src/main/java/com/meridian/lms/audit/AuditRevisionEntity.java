package com.meridian.lms.audit;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.RevisionEntity;
import org.hibernate.envers.RevisionNumber;
import org.hibernate.envers.RevisionTimestamp;

@Entity
@Table(name = "revinfo")
@RevisionEntity(AuditRevisionListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditRevisionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @RevisionNumber
    @Column(name = "rev")
    private Long id;

    @RevisionTimestamp
    @Column(name = "revtstmp", nullable = false)
    private Long timestamp;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_email", length = 255)
    private String actorEmail;
}