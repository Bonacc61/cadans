# Cadans Multi-Tenant Platform

**Production-ready** NanoClaw deployment system for Cadans customers.

Hybrid multi-tenant architecture: Shared VPS for Shared/Private tiers (€49-99/mo), dedicated VPS for Enterprise (€499/mo).

---

## Quick Start

### 1. Initialize Database

```bash
cd /root/cadans/platform
npm install

# Initialize database schema
sqlite3 db/tenants.db < db/schema.sql

# Or use Node.js
node -e "const { db } = require('./src/database'); db.initialize().then(() => console.log('✅ DB ready'));"
```

### 2. Provision Your First Tenant

```typescript
import { DeploymentOrchestrator } from './src/deployment-orchestrator';
import { CadansDatabase } from './src/database';
import { SubscriptionTier } from './src/tenant-manager';

const db = new CadansDatabase();
await db.initialize();

const orchestrator = new DeploymentOrchestrator(db);

// Provision Shared tier customer
const tenant = await orchestrator.provisionTenant({
  companyName: 'Acme BV',
  email: 'jan@acme.nl',
  tier: SubscriptionTier.SHARED,
  stripeCustomerId: 'cus_abc123',
  patternContributionConsent: true,
  consentIpAddress: '192.168.1.100',
});

console.log('✅ Tenant provisioned:', tenant);
```

### 3. Start Containers

```bash
cd /root/cadans/platform/docker

# Build tenant container image
docker build -f Dockerfile.tenant -t cadans-tenant /root/NanoClaw

# Start all containers
docker-compose -f docker-compose.shared.yml up -d

# Check status
docker ps | grep cadans
```

---

## Architecture Overview

### Tier Mapping

| Tier | Price | Infrastructure | Isolation | Pattern Contribution |
|------|-------|----------------|-----------|----------------------|
| **Shared** | €49/mo | Docker container on shared VPS | Process + namespace | Required ✅ |
| **Private** | €99/mo | Docker container on shared VPS | Process + namespace | Disabled ❌ |
| **Enterprise** | €499/mo | Dedicated VPS | Full infrastructure | Disabled ❌ |

### Resource Allocation

**Shared VPS (Hetzner CPX51: €28/mo):**
- 16 vCPU, 32GB RAM, 200GB storage
- Capacity: 16-20 customers
- Per-tenant limits: 1 vCPU, 1GB RAM, 5GB storage

**Shared/Private Tenant Container:**
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'      # Shared: 1.0, Private: 1.5
      memory: 1024M    # Shared: 1024M, Private: 2048M
```

**Enterprise Dedicated VPS (Hetzner CX31: €9/mo):**
- 2 vCPU, 8GB RAM, 80GB storage
- Full control, custom scaling

---

## Directory Structure

```
/root/cadans/platform/
├── src/
│   ├── tenant-manager.ts           # Core tenant CRUD operations
│   ├── deployment-orchestrator.ts  # Multi-VPS orchestration
│   ├── database.ts                 # SQLite wrapper
│   └── billing-integration.ts      # (TODO) Stripe webhooks
├── docker/
│   ├── Dockerfile.tenant           # NanoClaw container image
│   ├── docker-compose.shared.yml   # Multi-tenant compose file
│   └── docker-compose.enterprise.yml
├── config/
│   ├── shared-tier.yaml            # Feature flags + limits
│   ├── private-tier.yaml
│   └── enterprise-tier.yaml
├── db/
│   ├── schema.sql                  # Database schema
│   └── tenants.db                  # SQLite database
└── docs/
    └── MULTI-TENANT-ARCHITECTURE.md

/opt/cadans/
├── tenants/
│   ├── {tenant-id-1}/
│   │   ├── groups/                 # NanoClaw groups
│   │   ├── credentials/            # WhatsApp/Telegram auth
│   │   └── logs/
│   └── {tenant-id-2}/
└── deleted/                        # GDPR retention (30 days)
```

---

## Database Schema

### Key Tables

**tenants**
- `tenant_id` (PK), `company_name`, `tier`, `status`
- `stripe_customer_id`, `monthly_price_cents`
- `cpu_limit_cores`, `memory_limit_mb`, `storage_limit_gb`
- `pattern_contribution_consent`, `consent_timestamp`

**tenant_usage**
- `tenant_id` (FK), `timestamp`
- `cpu_usage_percent`, `memory_usage_mb`, `storage_usage_gb`
- `total_tokens`, `estimated_cost_cents`

**vps_inventory**
- `hostname`, `provider`, `total_cpu_cores`, `total_memory_mb`
- `allocated_cpu_cores`, `allocated_memory_mb`
- `status`, `monthly_cost_cents`

**audit_log**
- `tenant_id`, `action`, `actor_type`, `timestamp`
- Actions: `tenant_created`, `tenant_suspended`, `tier_upgraded`, `data_exported`

**alerts**
- `tenant_id`, `alert_type`, `severity`, `message`
- Types: `cpu_high`, `memory_high`, `api_cost_high`, `payment_failed`

---

## API Reference

### TenantManager

```typescript
class TenantManager {
  // Provision new tenant (Shared/Private tier)
  async provisionTenant(options: ProvisioningOptions): Promise<Tenant>

  // Suspend tenant (stop container, mark as suspended)
  async suspendTenant(tenantId: string, reason: string): Promise<void>

  // Reactivate suspended tenant
  async reactivateTenant(tenantId: string): Promise<void>

  // Delete tenant (GDPR Article 17: Right to Erasure)
  async deleteTenant(tenantId: string, options: DeletionOptions): Promise<void>

  // Export tenant data (GDPR Article 20: Data Portability)
  async exportTenantData(tenantId: string, options: ExportOptions): Promise<string>

  // Upgrade tier (e.g., Shared → Private)
  async upgradeTier(tenantId: string, newTier: SubscriptionTier): Promise<void>

  // Get current resource usage
  async getTenantUsage(tenantId: string): Promise<TenantUsage>

  // List all tenants
  async listTenants(filter?: { tier?: string; status?: string }): Promise<Tenant[]>
}
```

### DeploymentOrchestrator

```typescript
class DeploymentOrchestrator {
  // Provision tenant (auto-selects shared vs dedicated VPS)
  async provisionTenant(options: ProvisioningOptions): Promise<Tenant>

  // Provision dedicated VPS for Enterprise tier
  async provisionEnterpriseVPS(options: EnterpriseVPSOptions): Promise<any>

  // Monitor resource usage across all VPSs (creates alerts)
  async monitorResourceUsage(): Promise<void>

  // Migrate tenant to different VPS
  async migrateTenant(tenantId: string, targetVPSHostname: string): Promise<void>

  // Get deployment statistics
  async getDeploymentStats(): Promise<{
    totalTenants: number;
    activeVPSs: number;
    totalMRR: number;
    avgCPUUtilization: number;
    avgMemoryUtilization: number;
  }>
}
```

### CadansDatabase

```typescript
class CadansDatabase {
  // Tenant operations
  async insertTenant(tenant: Tenant): Promise<void>
  async getTenant(tenantId: string): Promise<Tenant | undefined>
  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<void>
  async listTenants(filter?: { tier?: string; status?: string }): Promise<Tenant[]>

  // Usage tracking
  async insertUsage(usage: TenantUsage): Promise<void>
  async getRecentUsage(tenantId: string, hours: number): Promise<TenantUsage[]>
  async getMonthlyTokens(tenantId: string): Promise<number>
  async getMonthlyCost(tenantId: string): Promise<number>

  // VPS management
  async getVPSAllocation(hostname: string): Promise<any>
  async getAvailableVPS(): Promise<string | null>

  // Alerts
  async createAlert(alert: Alert): Promise<void>
  async getUnresolvedAlerts(): Promise<Alert[]>

  // Analytics
  async getRevenueByTier(): Promise<any[]>
  async getTotalMRR(): Promise<number>
  async getChurnRate(days: number): Promise<number>
}
```

---

## Provisioning Flow

### Shared/Private Tier (Docker Container)

1. User signs up on cadans.nl → Stripe webhook
2. `DeploymentOrchestrator.provisionTenant()` called
3. Find available VPS with capacity (`getAvailableVPS()`)
4. Create directory structure: `/opt/cadans/tenants/{tenant-id}/`
5. Initialize NanoClaw database and `CLAUDE.md`
6. Generate docker-compose service definition
7. Start Docker container with resource limits
8. Insert tenant record into database
9. Send welcome email with onboarding link

**Downtime:** None (instant provisioning)

### Enterprise Tier (Dedicated VPS)

1. Manual sales process (€499/mo requires human touch)
2. `DeploymentOrchestrator.provisionEnterpriseVPS()` called
3. Provision Hetzner VPS via API (or manual)
4. Install Docker + NanoClaw
5. Configure DNS: `customer.cadans.nl`
6. SSL certificate (Let's Encrypt)
7. Firewall rules
8. Backup schedule (daily to Backblaze B2)
9. Send credentials to customer admin

**Downtime:** 10-20 minutes (VPS provisioning + DNS propagation)

---

## Scaling Strategy

### Horizontal Scaling (Add Shared VPSs)

**Trigger:** VPS reaches 16 customers OR 80% resource utilization

**Steps:**
1. `provisionNewSharedVPS()` creates database record
2. Manually provision Hetzner CPX51 (€28/mo)
3. Install Docker + NanoClaw
4. Update `vps_inventory` table with IP address
5. New customers automatically route to new VPS

**Capacity Plan:**
- VPS 1: 16 customers (Month 1-3) → €784/mo revenue
- VPS 2: 16 customers (Month 4-6) → €1,568/mo revenue
- VPS 3: 16 customers (Month 7-9) → €2,352/mo revenue
- **48 customers on €84/mo infrastructure = 96% gross margin**

### Vertical Scaling (Upgrade VPS)

**When:** More Private tier customers (higher resource needs)

**Action:** Upgrade Hetzner VPS: CPX51 → CPX61 (32 vCPU, 64GB RAM)
- Capacity increases to 24-32 customers
- Cost increases to €56/mo (still <3% of revenue)

---

## GDPR Compliance

### Data Isolation

**Container-level isolation:**
```yaml
volumes:
  - /opt/cadans/tenants/{tenant-id}/groups:/app/groups      # Isolated data
  - /opt/cadans/tenants/{tenant-id}/credentials:/app/.credentials

networks:
  - tenant-{tenant-id}  # No cross-tenant communication
```

**Verification:**
```bash
# Can container A access container B's files?
docker exec cadans-abc123 ls /opt/cadans/tenants/xyz789/
# Expected: Permission denied

# Can container A ping container B?
docker exec cadans-abc123 ping cadans-xyz789
# Expected: Network unreachable
```

### Right to Erasure (Article 17)

```typescript
await tenantManager.deleteTenant(tenantId, {
  reason: 'customer_request',
  retentionDays: 30,  // Keep for 30 days then permanent delete
  exportData: true,   // Export before deletion
});

// Steps:
// 1. Stop container
// 2. Export data (if requested)
// 3. Move to /opt/cadans/deleted/{tenant-id}/
// 4. Mark as deleted in database
// 5. After 30 days: rm -rf /opt/cadans/deleted/{tenant-id}/
// 6. Remove patterns from GlobalReasoningBank (Shared tier)
```

### Right to Data Portability (Article 20)

```typescript
const exportPath = await tenantManager.exportTenantData(tenantId, {
  format: 'json',
  includeRawMessages: true,
  includePatterns: true,
});

// Output: /tmp/tenant-export-{tenant-id}-{timestamp}.zip
// - nanoclaw.db (SQLite)
// - messages.json (all conversations)
// - patterns.json (ReasoningBank data)
// - CLAUDE.md (group memory)
```

---

## Monitoring & Alerts

### Resource Monitoring (runs every 60s)

```typescript
await orchestrator.monitorResourceUsage();

// Checks:
// - VPS CPU >80% → Warning alert
// - VPS Memory >80% → Warning alert
// - VPS CPU/Memory >90% → Critical alert (provision new VPS)
// - Customer Claude API cost >€50/mo on Shared tier → Upsell trigger
```

### Alert Types

**Critical (PagerDuty):**
- Container crashed (restart failed 3x)
- VPS CPU/memory >90%
- Payment failed (subscription canceled)

**Warning (Email):**
- Container CPU >80%
- Customer approaching storage limit
- Heavy API usage (upsell opportunity)

---

## Cost Analysis

### Shared VPS Economics

**Hetzner CPX51: €28/mo**
- Capacity: 16 customers (mix of Shared €49 + Private €99)
- Example: 10 Shared + 6 Private = €1,084/mo revenue
- Claude API costs: 16 × €15/mo = €240/mo
- **Total COGS: €268/mo**
- **Gross Profit: €816/mo (75% margin)**

### Enterprise Economics

**Hetzner CX31: €9/mo per customer**
- Revenue: €499/mo
- Claude API costs: €30/mo (higher usage)
- **Total COGS: €39/mo**
- **Gross Profit: €460/mo (92% margin)**

### Blended Margins (realistic mix)

**Year 1 (40 customers):**
- 25 Shared (€49) = €1,225/mo
- 10 Private (€99) = €990/mo
- 5 Enterprise (€499) = €2,495/mo
- **Total MRR: €4,710/mo**
- **Total COGS: €900/mo** (2 shared VPSs + 5 dedicated VPSs + API)
- **Gross Margin: 81%**

---

## Roadmap

### Phase 1: MVP (Week 1-2) ✅
- [x] Architecture design
- [x] Database schema
- [x] TenantManager (CRUD operations)
- [x] DeploymentOrchestrator
- [x] Docker isolation
- [x] Configuration files

### Phase 2: Automation (Week 3-4)
- [ ] Stripe webhook integration
- [ ] Automated provisioning (no manual steps)
- [ ] Resource monitoring cron job
- [ ] Alert notifications (email/PagerDuty)

### Phase 3: Admin Dashboard (Week 5-6)
- [ ] React dashboard (reuse NanoClaw dashboard)
- [ ] Customer list + health status
- [ ] Resource usage charts (Prometheus + Grafana)
- [ ] Billing overview (MRR, churn, LTV)

### Phase 4: Customer Portal (Week 7-8)
- [ ] Self-service signup (Stripe Checkout)
- [ ] Onboarding wizard (channel setup)
- [ ] Usage dashboard (for customers)
- [ ] Tier upgrade flow

### Phase 5: Scale (Month 3-6)
- [ ] Hetzner API integration (auto-provision VPSs)
- [ ] Multi-region support (Amsterdam, Frankfurt)
- [ ] Advanced monitoring (anomaly detection)
- [ ] Cost optimization (auto-scale down idle customers)

---

## Manual Operations (Until Automated)

### Provision Shared VPS

```bash
# 1. Create Hetzner CPX51 server
# - Region: Nuremberg (nbg1)
# - Image: Ubuntu 22.04
# - SSH key: Add your key

# 2. SSH to server
ssh root@{vps-ip}

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Install Docker Compose
apt install docker-compose-plugin

# 5. Clone NanoClaw
git clone https://github.com/your-org/nanoclaw.git /root/NanoClaw
cd /root/NanoClaw
npm install && npm run build

# 6. Create tenant directories
mkdir -p /opt/cadans/tenants

# 7. Copy docker-compose file
cp /root/cadans/platform/docker/docker-compose.shared.yml /opt/cadans/

# 8. Update database with VPS IP
sqlite3 /root/cadans/platform/db/tenants.db
UPDATE vps_inventory SET ip_address = '{vps-ip}' WHERE hostname = 'shared-vps-01.cadans.nl';
```

### Provision Enterprise VPS

```bash
# 1. Create Hetzner CX31 server (or higher)
# 2. Follow steps 2-5 above
# 3. Configure DNS: customer.cadans.nl → {vps-ip}
# 4. Install Let's Encrypt SSL
apt install certbot
certbot certonly --standalone -d customer.cadans.nl

# 5. Configure firewall (only customer IP ranges)
ufw allow from {customer-ip-range} to any port 22
ufw enable
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs cadans-{tenant-id}

# Check resource limits
docker stats cadans-{tenant-id}

# Restart container
docker-compose -f /opt/cadans/docker-compose.shared.yml restart cadans-{tenant-id}
```

### VPS Out of Capacity

```bash
# Check allocation
sqlite3 /root/cadans/platform/db/tenants.db
SELECT * FROM vps_allocation;

# Provision new VPS (see manual operations above)
```

### Tenant Data Recovery

```bash
# List backups (if configured)
ls -lh /opt/cadans/deleted/{tenant-id}/

# Restore from backup
cp -r /opt/cadans/deleted/{tenant-id}/ /opt/cadans/tenants/{tenant-id}/

# Reactivate tenant
node -e "const { TenantManager } = require('./src/tenant-manager'); new TenantManager().reactivateTenant('{tenant-id}');"
```

---

## Security Considerations

### Container Escape Prevention

- Docker user namespaces (container root ≠ host root)
- AppArmor/SELinux profiles
- Read-only root filesystem (except /app/groups)
- No privileged containers
- Kernel security modules (seccomp)

### API Key Isolation

- Per-container environment variables
- Never store API keys in database
- Quarterly key rotation

### Backup Security

- All backups encrypted with GPG
- Key stored in 1Password (not on VPS)
- Backups to Backblaze B2 (EU region)

---

## Support

- **Documentation:** `/root/cadans/platform/docs/`
- **Issues:** Create issue in internal repo
- **Architecture Questions:** See `MULTI-TENANT-ARCHITECTURE.md`

---

## License

Proprietary - Cadans BV
