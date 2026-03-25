# Cadans Multi-Tenant Architecture

**Document Type:** Technical Architecture Design
**Date:** 2026-03-25
**Status:** Implementation Ready
**Decision:** Hybrid Multi-Tenant (Shared VPS for Shared/Private, Dedicated VPS for Enterprise)

---

## Executive Summary

Cadans uses a **hybrid multi-tenant architecture** to balance cost efficiency with compliance requirements:

- **Shared Tier (€49/mo):** Multiple tenants on one VPS, Docker-isolated, contributes patterns
- **Private Tier (€99/mo):** Multiple tenants on one VPS, Docker-isolated, data stays private
- **Enterprise Tier (€499/mo):** Dedicated VPS, full infrastructure isolation, air-gapped

**Key Decision:** Start with one shared VPS for first 20 customers, scale horizontally as needed.

---

## Architecture Options Evaluated

### Option 1: Single Process, Multiple Groups ❌
**Rejected - Security Risk**

```
One Node.js process
├── groups/customer-1/
├── groups/customer-2/
└── groups/customer-3/
```

**Pros:**
- Simplest to implement
- Lowest resource usage

**Cons:**
- ❌ One customer's bug crashes everyone
- ❌ Insufficient isolation for GDPR compliance
- ❌ Memory leaks affect all tenants
- ❌ No per-tenant resource limits

**Verdict:** Not production-grade for paid customers.

---

### Option 2: Docker Containers per Tenant ✅
**SELECTED - Best Balance**

```
Shared VPS (Hetzner CPX51: 16 vCPU, 32GB RAM, €28/mo)
├── cadans-customer-1 (Docker container)
│   ├── NanoClaw process
│   ├── groups/customer-1/
│   └── Resource limits: 1GB RAM, 1 vCPU
├── cadans-customer-2 (Docker container)
│   └── ...
└── cadans-monitoring (Docker container)
    └── Prometheus + Grafana
```

**Pros:**
- ✅ Strong isolation (separate processes, namespaces, cgroups)
- ✅ Per-tenant resource limits (prevent noisy neighbor)
- ✅ Easy to move container to dedicated VPS (Enterprise upgrade path)
- ✅ GDPR-compliant separation
- ✅ One tenant crash doesn't affect others

**Cons:**
- Moderate overhead (~100MB per container)
- Requires Docker orchestration

**Capacity:** 16-20 customers per Hetzner CPX51 VPS (1GB RAM + 0.5 vCPU per tenant)

**Verdict:** Production-ready, scalable, cost-efficient.

---

### Option 3: Dedicated VPS per Tenant ✅
**SELECTED - Enterprise Tier Only**

```
Customer Acme BV (€499/mo)
└── Dedicated Hetzner CX21 (2 vCPU, 4GB RAM, €5/mo)
    └── Full NanoClaw instance
```

**When to Use:**
- Enterprise tier (€499/mo justifies dedicated infra)
- Customer demands air-gapped isolation
- Regulatory requirements (banking, healthcare)

**Pros:**
- ✅ Complete isolation
- ✅ Custom resource scaling
- ✅ Dedicated IP address
- ✅ No noisy neighbor risk

**Cons:**
- Higher per-customer cost (€5-10/mo VPS)
- More complex infrastructure management

**Verdict:** Premium offering for high-value customers.

---

## Selected Architecture: Hybrid Multi-Tenant

### Tier Mapping

| Tier | Infrastructure | VPS Cost | Customer Density | Isolation Level |
|------|----------------|----------|------------------|-----------------|
| **Shared (€49/mo)** | Docker container on shared VPS | €28/mo ÷ 16 = €1.75/customer | 16-20 per VPS | Process + namespace |
| **Private (€99/mo)** | Docker container on shared VPS | €28/mo ÷ 16 = €1.75/customer | 16-20 per VPS | Process + namespace |
| **Enterprise (€499/mo)** | Dedicated VPS | €5-10/mo | 1 per VPS | Full infrastructure |

### Cost Analysis

**Shared VPS (Hetzner CPX51: €28/mo):**
- Capacity: 16 customers
- Revenue: 16 × €49 = €784/mo
- COGS: €28 VPS + (16 × €15 Claude API) = €268/mo
- **Gross Margin: 66%** (€516/mo profit)

**Mixed Shared VPS (realistic):**
- 10 Shared (€49) + 6 Private (€99) = €1,084/mo revenue
- COGS: €28 VPS + (16 × €15 Claude API) = €268/mo
- **Gross Margin: 75%** (€816/mo profit)

**Enterprise Customer:**
- Revenue: €499/mo
- COGS: €10 VPS + €30 Claude API = €40/mo
- **Gross Margin: 92%** (€459/mo profit)

---

## Implementation Design

### 1. Directory Structure

```
/root/cadans/platform/
├── src/
│   ├── tenant-manager.ts           # Tenant CRUD operations
│   ├── provisioner.ts              # Provision new containers
│   ├── resource-monitor.ts         # Track CPU/RAM usage per tenant
│   └── deployment-orchestrator.ts  # Decide shared vs dedicated VPS
├── docker/
│   ├── Dockerfile.tenant           # NanoClaw container image
│   ├── docker-compose.shared.yml   # Multi-tenant on one VPS
│   └── docker-compose.enterprise.yml
├── config/
│   ├── shared-tier.yaml            # Resource limits
│   ├── private-tier.yaml
│   └── enterprise-tier.yaml
└── db/
    └── tenants.db                  # SQLite: tenant metadata
```

### 2. Tenant Metadata Schema

```sql
CREATE TABLE tenants (
  tenant_id TEXT PRIMARY KEY,          -- UUID
  company_name TEXT NOT NULL,          -- "Acme BV"
  tier TEXT NOT NULL,                  -- 'shared' | 'private' | 'enterprise'
  container_id TEXT,                   -- Docker container ID (null for enterprise on different VPS)
  vps_hostname TEXT,                   -- 'shared-vps-01.cadans.nl' or 'acme.cadans.nl'
  status TEXT NOT NULL,                -- 'active' | 'suspended' | 'canceled'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Billing
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  monthly_price_cents INTEGER,         -- 4900, 9900, or 49900

  -- Resource allocation
  cpu_limit_cores REAL,                -- 0.5, 1.0, 2.0
  memory_limit_mb INTEGER,             -- 1024, 2048, 4096
  storage_limit_gb INTEGER,            -- 5, 10, 50

  -- GDPR compliance
  pattern_contribution_consent BOOLEAN DEFAULT FALSE,
  consent_timestamp DATETIME,
  consent_ip_address TEXT,
  data_deletion_requested_at DATETIME  -- Article 17 erasure
);

CREATE TABLE tenant_usage (
  usage_id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Resource usage
  cpu_usage_percent REAL,              -- 0-100
  memory_usage_mb INTEGER,
  storage_usage_gb REAL,

  -- Claude API costs
  total_tokens INTEGER,
  estimated_cost_cents INTEGER,        -- Track for billing alerts

  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE INDEX idx_tenant_usage_lookup ON tenant_usage(tenant_id, timestamp);
```

### 3. Docker Isolation Strategy

**Dockerfile.tenant:**
```dockerfile
FROM node:20-slim

# Create non-root user for security
RUN useradd -m -u 1000 nanoclaw

WORKDIR /app

# Copy NanoClaw source
COPY package*.json ./
RUN npm ci --production

COPY . .

# Tenant-specific mount points (bind mounts at runtime)
VOLUME ["/app/groups", "/app/.credentials"]

# Resource limits enforced by docker-compose
USER nanoclaw

CMD ["npm", "start"]
```

**docker-compose.shared.yml (excerpt):**
```yaml
version: '3.8'

services:
  cadans-customer-abc123:
    build:
      context: ../../NanoClaw
      dockerfile: ../cadans/platform/docker/Dockerfile.tenant
    container_name: cadans-abc123
    restart: unless-stopped

    # Resource limits (cgroups)
    deploy:
      resources:
        limits:
          cpus: '1.0'          # 1 vCPU core
          memory: 1024M        # 1GB RAM
        reservations:
          cpus: '0.5'
          memory: 512M

    # Isolated storage
    volumes:
      - /opt/cadans/tenants/abc123/groups:/app/groups
      - /opt/cadans/tenants/abc123/credentials:/app/.credentials

    # Environment variables
    environment:
      - TENANT_ID=abc123
      - TIER=shared
      - CLAUDE_API_KEY=${CLAUDE_API_KEY_ABC123}  # Per-tenant API key
      - DATABASE_PATH=/app/groups/global/nanoclaw.db

    # Network isolation
    networks:
      - tenant-abc123

    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  tenant-abc123:
    driver: bridge
```

**Key Isolation Features:**
- ✅ CPU/memory limits via `deploy.resources`
- ✅ Separate volumes (no cross-tenant access)
- ✅ Separate networks (no cross-tenant communication)
- ✅ Per-tenant Claude API keys (cost tracking)
- ✅ Non-root user (security)

---

## Provisioning Flow

### New Customer Signup (Shared/Private Tier)

```typescript
// 1. User signs up on cadans.nl → Stripe webhook
POST /api/webhooks/stripe/customer.subscription.created
{
  "customer_id": "cus_abc123",
  "email": "jan@acme.nl",
  "tier": "shared",
  "company_name": "Acme BV"
}

// 2. Tenant Manager provisions container
await tenantManager.provisionTenant({
  companyName: "Acme BV",
  email: "jan@acme.nl",
  tier: "shared",
  stripeCustomerId: "cus_abc123"
});

// Steps executed:
// a. Generate tenant_id (UUID)
// b. Create database record in tenants table
// c. Create directory structure: /opt/cadans/tenants/{tenant_id}/
// d. Generate docker-compose service definition
// e. Start Docker container with resource limits
// f. Initialize NanoClaw database in groups/global/
// g. Send welcome email with onboarding link
// h. Return: { tenant_id, onboarding_url, container_status }
```

### Enterprise Customer (Dedicated VPS)

```typescript
// 1. Manual sales process (€499/mo requires human touch)
// 2. Provision dedicated VPS via Terraform/Hetzner API

await deploymentOrchestrator.provisionEnterpriseVPS({
  tenantId: "enterprise-xyz789",
  companyName: "BigCorp BV",
  vpsSize: "cx31",  // 2 vCPU, 8GB RAM
  region: "nbg1"    // Nuremberg (EU/GDPR)
});

// Steps executed:
// a. Create Hetzner VPS via API
// b. Install Docker + NanoClaw
// c. Configure dedicated domain: bigcorp.cadans.nl
// d. SSL certificate (Let's Encrypt)
// e. Firewall rules (only customer IP ranges)
// f. Backup schedule (daily to Backblaze B2)
// g. Monitoring (Prometheus exporters)
// h. Send credentials to customer admin
```

---

## Scaling Strategy

### Horizontal Scaling (Add More Shared VPSs)

**Trigger:** Shared VPS reaches 16 customers or 80% resource usage

**Action:**
1. Provision new shared VPS: `shared-vps-02.cadans.nl`
2. New customers route to new VPS
3. Load balancer (optional, for future): Distribute by region/load

**Capacity Plan:**
- VPS 1: 16 customers (Month 1-3)
- VPS 2: 16 customers (Month 4-6)
- VPS 3: 16 customers (Month 7-9)
- **48 customers = €2,352/mo revenue on €84/mo infrastructure (96% gross margin)**

### Vertical Scaling (Upgrade VPS Size)

**When:** More customers want Private tier (higher resource needs)

**Action:** Upgrade Hetzner VPS from CPX51 → CPX61 (32GB RAM, 32 vCPU)
- Capacity increases to 24-32 customers per VPS
- Cost increases to €56/mo (still <3% of revenue)

---

## GDPR Compliance

### Data Isolation

**Shared/Private Tier (Docker Containers):**
- Separate volume mounts (no cross-tenant file access)
- Separate SQLite databases
- Separate Docker networks (no inter-container communication)
- Separate Claude API keys (no conversation mixing)

**Verification:**
```bash
# Test: Can container A access container B's files?
docker exec cadans-abc123 ls /opt/cadans/tenants/xyz789/
# Expected: Permission denied

# Test: Can container A ping container B?
docker exec cadans-abc123 ping cadans-xyz789
# Expected: Network unreachable
```

### Data Deletion (Article 17 Right to Erasure)

```typescript
await tenantManager.deleteTenant(tenantId, {
  reason: "customer_request",  // or "subscription_canceled"
  retentionDays: 30            // Keep for 30 days then permanent delete
});

// Steps:
// 1. Stop Docker container
// 2. Export data to /opt/cadans/deleted/{tenant_id}/ (compliance backup)
// 3. Mark tenant as deleted in database
// 4. After 30 days: rm -rf /opt/cadans/deleted/{tenant_id}/
// 5. If Shared tier: Remove patterns from GlobalReasoningBank
```

### Data Portability (Article 20)

```typescript
await tenantManager.exportTenantData(tenantId, {
  format: "json",  // or "csv"
  includeRawMessages: true,
  includePatterns: true
});

// Output: tenant-data-export-{date}.zip
// - nanoclaw.db (SQLite)
// - messages.json (all conversations)
// - patterns.json (ReasoningBank data)
// - CLAUDE.md (group memory)
```

---

## Monitoring & Alerts

### Per-Tenant Metrics

**Collected every 60 seconds:**
- CPU usage (%)
- Memory usage (MB)
- Disk usage (GB)
- Network I/O (MB)
- Claude API tokens (cost tracking)
- Container health status

**Stored in:** `tenant_usage` table + Prometheus

**Dashboards:**
- Admin view: All tenants on one VPS (resource distribution)
- Per-tenant view: Customer's own usage (transparency)

### Alerts

**Critical (PagerDuty):**
- Container crashed (restart failed 3x)
- VPS CPU >90% for 5 minutes (scale horizontally)
- VPS memory >90% for 5 minutes
- Customer over budget (Claude API cost >€50/mo on Shared tier)

**Warning (Email):**
- Container CPU >80% for 10 minutes (noisy neighbor)
- Customer approaching storage limit (80% of quota)
- Payment failed (Stripe webhook)

---

## Security Considerations

### Container Escape Prevention

**Measures:**
- Docker user namespaces (container root ≠ host root)
- AppArmor/SELinux profiles
- Read-only root filesystem (except /app/groups)
- No privileged containers
- Kernel security modules (seccomp)

**Testing:**
```bash
# Attempt to escape container
docker exec cadans-abc123 cat /etc/shadow
# Expected: Permission denied

# Attempt to access host Docker socket
docker exec cadans-abc123 ls /var/run/docker.sock
# Expected: No such file or directory
```

### API Key Isolation

**Problem:** Shared NanoClaw code, but different Claude API keys per tenant

**Solution:** Environment variable per container
```yaml
environment:
  - CLAUDE_API_KEY=${CLAUDE_API_KEY_ABC123}  # Customer-specific
```

**Key Rotation:**
- Store keys in environment variable (not in code)
- Rotate quarterly
- Use Stripe customer ID as reference (never store API key in tenant DB)

### Backup Security

**Encryption at rest:**
- All backups encrypted with GPG
- Key stored in 1Password (not on VPS)
- Backups to Backblaze B2 (EU region)

**Retention:**
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months
- Then permanent deletion (GDPR storage minimization)

---

## Cost Optimization

### Claude API Cost Tracking

**Problem:** Claude costs vary wildly per customer (heavy users = margin squeeze)

**Solution:** Track per-tenant API usage
```typescript
// In tenant_usage table
const monthlyTokens = await db.getTenantUsage(tenantId, {
  metric: 'total_tokens',
  period: 'current_month'
});

const estimatedCost = (monthlyTokens * 0.000015);  // $0.015 per 1k tokens

if (estimatedCost > 50 && tier === 'shared') {
  // Alert: Customer using €50/mo Claude API on €49/mo plan
  await sendAlert('heavy_user', { tenantId, estimatedCost });
  // Action: Upsell to Private tier or add usage-based billing
}
```

### Resource Right-Sizing

**Shared Tier (€49/mo):**
- Default: 1 vCPU, 1GB RAM
- Monitor: If customer averages <0.3 vCPU, reduce to 0.5 vCPU (free up capacity)

**Private Tier (€99/mo):**
- Default: 1.5 vCPU, 2GB RAM
- Monitor: If customer consistently maxes out, offer Enterprise upgrade

---

## Migration Paths

### Shared → Private (Customer Upgrades)

**No infrastructure change needed:**
1. Update `tier` in database
2. Update `pattern_contribution_consent = FALSE`
3. Remove from GlobalReasoningBank pattern contribution
4. Increase resource limits (1GB → 2GB RAM)
5. Update Stripe subscription

**Downtime:** Zero (just restart container with new limits)

### Private → Enterprise (Customer Upgrades)

**Requires VPS migration:**
1. Provision dedicated VPS
2. Stop container on shared VPS
3. Rsync data to new VPS: `/opt/cadans/tenants/{id}/ → /opt/cadans/enterprise/{id}/`
4. Start container on new VPS
5. Update DNS (if custom domain)
6. Decommission shared container

**Downtime:** ~10 minutes (during rsync + DNS propagation)

### Enterprise → Private (Customer Downgrades)

**Rare but possible:**
1. Export data from dedicated VPS
2. Import to shared VPS container
3. Decommission dedicated VPS (Hetzner credit)
4. Refund pro-rated difference

---

## Implementation Roadmap

### Phase 1: MVP (Week 1-2)
- [x] Architecture design (this document)
- [ ] tenant-manager.ts (CRUD operations)
- [ ] Dockerfile.tenant
- [ ] docker-compose.shared.yml template
- [ ] Manual provisioning script (for first 3 customers)

### Phase 2: Automation (Week 3-4)
- [ ] Stripe webhook → auto-provision
- [ ] Billing integration (usage tracking)
- [ ] Resource monitoring (Prometheus)
- [ ] Admin dashboard (customer list)

### Phase 3: Scale (Week 5-8)
- [ ] Terraform for VPS provisioning
- [ ] Horizontal scaling automation (add VPS when full)
- [ ] Enterprise tier provisioning
- [ ] GDPR deletion automation (30-day purge)

### Phase 4: Polish (Month 3-6)
- [ ] Customer self-service portal (view usage, upgrade tier)
- [ ] Advanced monitoring (anomaly detection)
- [ ] Cost optimization (auto-scale down idle customers)
- [ ] Multi-region (add VPS in Amsterdam for latency)

---

## Decision Log

**2026-03-25: Selected Docker Containers on Shared VPS**
- **Why:** Best balance of isolation, cost, and scalability
- **Alternative considered:** Kubernetes (overkill for <100 customers)
- **Next review:** At 50 customers (re-evaluate if K8s needed)

**2026-03-25: One VPS per 16 Customers**
- **Why:** Hetzner CPX51 provides 32GB RAM (16 × 1GB containers + 16GB buffer)
- **Alternative considered:** 32 customers per VPS (too risky, no headroom)
- **Trigger to add VPS:** 80% resource usage OR 16 customers (whichever first)

**2026-03-25: SQLite for Tenant Metadata**
- **Why:** Simple, sufficient for <1000 tenants, no external DB dependency
- **Alternative considered:** PostgreSQL (premature, adds complexity)
- **Migration path:** At 200 customers, migrate to Postgres if needed

---

## Questions to Answer Before Implementation

1. **VPS Provider:** Hetzner (EU, GDPR-compliant) or DigitalOcean (more familiar)?
   - **Recommendation:** Hetzner (€28/mo vs DigitalOcean $48/mo for same specs, EU-based)

2. **Docker Orchestration:** Docker Compose or Kubernetes?
   - **Recommendation:** Docker Compose until 50+ customers (K8s is overkill)

3. **Monitoring Stack:** Prometheus + Grafana or third-party (Datadog)?
   - **Recommendation:** Self-hosted Prometheus (cost, privacy), upgrade to Datadog at 100+ customers

4. **Backup Storage:** Backblaze B2 or AWS S3?
   - **Recommendation:** Backblaze (10x cheaper, GDPR-compliant EU region)

5. **Domain Strategy:** Subdomains (acme.cadans.nl) or shared domain (cadans.nl/acme)?
   - **Recommendation:** Subdomains for Enterprise, shared domain for Shared/Private

---

## References

- [NanoClaw Architecture](/root/NanoClaw/CLAUDE.md)
- [Cadans Business Strategy](/root/cadans/BUSINESS-STRATEGY.md)
- [Data Monetization Strategy](/root/cadans/strategy-and-compliance/DATA-MONETIZATION-STRATEGY.md)
- [Docker Resource Limits Docs](https://docs.docker.com/compose/compose-file/deploy/)
- [GDPR Article 32: Security of Processing](https://gdpr-info.eu/art-32-gdpr/)

