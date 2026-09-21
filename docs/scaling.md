# Scaling Path

Current: single Postgres container.

## When we outgrow this

1. **Read replicas** — Postgres streaming replication to 1-2 replicas.
   Route `@Transactional(readOnly = true)` queries to replicas via Spring's
   `AbstractRoutingDataSource`. Writes stay on primary.

2. **Connection pool per replica** — HikariCP per data source.

3. **Caching layer** — Redis already present. Add read-through cache for
   loan detail queries. Invalidation via `@CacheEvict` on mutations.

4. **Partitioning** — Partition `payments` by `due_date` (monthly).
   Postgres native partitioning. Drop old partitions after archival.

5. **Sharding** — Only if writes exceed a single primary's capacity.
   Shard by `customer_id`. Requires application-level routing.
   Last resort — most systems never need it.