-- Cadans Multi-Tenant Platform Database Schema
-- SQLite database for tenant metadata and usage tracking

-- ============================================================================
-- Tenants Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenants (
  tenant_id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK(tier IN ('shared', 'private', 'enterprise')),
  container_id TEXT,
  vps_hostname TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('active', 'suspended', 'canceled', 'provisioning')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Billing
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  monthly_price_cents INTEGER NOT NULL,

  -- Resource allocation
  cpu_limit_cores REAL NOT NULL,
  memory_limit_mb INTEGER NOT NULL,
  storage_limit_gb INTEGER NOT NULL,

  -- GDPR compliance
  pattern_contribution_consent BOOLEAN DEFAULT FALSE,
  consent_timestamp DATETIME,
  consent_ip_address TEXT,
  consent_version TEXT DEFAULT '1.0',
  data_deletion_requested_at DATETIME
);

CREATE INDEX idx_tenants_tier ON tenants(tier);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_stripe_customer ON tenants(stripe_customer_id);
CREATE INDEX idx_tenants_vps ON tenants(vps_hostname);

-- ============================================================================
-- Tenant Usage Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_usage (
  usage_id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Resource usage
  cpu_usage_percent REAL,
  memory_usage_mb INTEGER,
  storage_usage_gb REAL,

  -- Claude API costs
  total_tokens INTEGER DEFAULT 0,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  estimated_cost_cents INTEGER DEFAULT 0,

  -- Message volume
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,

  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE INDEX idx_tenant_usage_lookup ON tenant_usage(tenant_id, timestamp DESC);
CREATE INDEX idx_tenant_usage_timestamp ON tenant_usage(timestamp);

-- ============================================================================
-- Billing Events Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS billing_events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Event details
  event_type TEXT NOT NULL CHECK(event_type IN (
    'subscription_created',
    'subscription_updated',
    'subscription_canceled',
    'payment_succeeded',
    'payment_failed',
    'invoice_created',
    'invoice_paid',
    'refund_issued'
  )),

  -- Stripe data
  stripe_event_id TEXT UNIQUE,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'eur',

  -- Metadata
  metadata TEXT, -- JSON blob for additional data

  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE INDEX idx_billing_events_tenant ON billing_events(tenant_id, timestamp DESC);
CREATE INDEX idx_billing_events_type ON billing_events(event_type);
CREATE INDEX idx_billing_events_stripe ON billing_events(stripe_event_id);

-- ============================================================================
-- Audit Log Table (GDPR compliance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Action details
  action TEXT NOT NULL CHECK(action IN (
    'tenant_created',
    'tenant_suspended',
    'tenant_reactivated',
    'tenant_deleted',
    'tier_upgraded',
    'tier_downgraded',
    'data_exported',
    'consent_granted',
    'consent_revoked',
    'container_started',
    'container_stopped'
  )),

  -- Actor (who performed the action)
  actor_type TEXT CHECK(actor_type IN ('admin', 'system', 'webhook', 'customer')),
  actor_id TEXT, -- admin user ID, webhook ID, etc.

  -- Details
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT, -- JSON blob for additional context

  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_log_tenant ON audit_log(tenant_id, timestamp DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);

-- ============================================================================
-- Alerts Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS alerts (
  alert_id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Alert details
  alert_type TEXT NOT NULL CHECK(alert_type IN (
    'cpu_high',
    'memory_high',
    'storage_high',
    'api_cost_high',
    'container_unhealthy',
    'payment_failed',
    'subscription_canceled'
  )),

  severity TEXT NOT NULL CHECK(severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  resolved_at DATETIME,

  -- Thresholds (for resource alerts)
  threshold_value REAL,
  current_value REAL,

  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE INDEX idx_alerts_tenant ON alerts(tenant_id, timestamp DESC);
CREATE INDEX idx_alerts_unresolved ON alerts(resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_alerts_severity ON alerts(severity);

-- ============================================================================
-- VPS Inventory Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS vps_inventory (
  vps_id INTEGER PRIMARY KEY AUTOINCREMENT,
  hostname TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL CHECK(provider IN ('hetzner', 'digitalocean', 'custom')),
  provider_vps_id TEXT, -- Hetzner server ID

  -- Capacity
  total_cpu_cores INTEGER NOT NULL,
  total_memory_mb INTEGER NOT NULL,
  total_storage_gb INTEGER NOT NULL,

  -- Current allocation
  allocated_cpu_cores REAL DEFAULT 0,
  allocated_memory_mb INTEGER DEFAULT 0,
  allocated_storage_gb INTEGER DEFAULT 0,

  -- Status
  status TEXT NOT NULL CHECK(status IN ('active', 'maintenance', 'decommissioned')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Cost tracking
  monthly_cost_cents INTEGER NOT NULL,

  -- Metadata
  region TEXT, -- 'nbg1' (Nuremberg), 'fsn1' (Falkenstein)
  ip_address TEXT,
  metadata TEXT -- JSON blob
);

CREATE INDEX idx_vps_status ON vps_inventory(status);
CREATE INDEX idx_vps_provider ON vps_inventory(provider);

-- ============================================================================
-- Pattern Contributions Table (for Shared tier data monetization)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pattern_contributions (
  contribution_id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Pattern details
  pattern_type TEXT NOT NULL, -- 'recruiting', 'invoicing', 'email_workflow', etc.
  pattern_hash TEXT NOT NULL, -- SHA-256 hash for deduplication
  anonymized_strategy TEXT NOT NULL, -- The actual pattern (PII-free)

  -- Metadata
  domain TEXT, -- 'recruiting_nl_tech', 'freelance_admin', etc.
  quality_score REAL CHECK(quality_score >= 0 AND quality_score <= 1),
  success_rate REAL CHECK(success_rate >= 0 AND success_rate <= 1),

  -- k-anonymity check
  k_anonymity_count INTEGER, -- How many tenants contributed similar pattern
  accepted BOOLEAN DEFAULT FALSE, -- TRUE if k >= 5

  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE SET NULL
);

CREATE INDEX idx_pattern_contributions_tenant ON pattern_contributions(tenant_id);
CREATE INDEX idx_pattern_contributions_hash ON pattern_contributions(pattern_hash);
CREATE INDEX idx_pattern_contributions_accepted ON pattern_contributions(accepted);
CREATE INDEX idx_pattern_contributions_type ON pattern_contributions(pattern_type);

-- ============================================================================
-- Admin Users Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  admin_id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('owner', 'admin', 'support')),

  -- Authentication
  password_hash TEXT NOT NULL, -- bcrypt hash
  totp_secret TEXT, -- For 2FA

  -- Status
  status TEXT NOT NULL CHECK(status IN ('active', 'suspended')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_status ON admin_users(status);

-- ============================================================================
-- Initial Data
-- ============================================================================

-- Insert default VPS (for development)
INSERT OR IGNORE INTO vps_inventory (
  hostname,
  provider,
  total_cpu_cores,
  total_memory_mb,
  total_storage_gb,
  status,
  monthly_cost_cents,
  region
) VALUES (
  'shared-vps-01.cadans.nl',
  'hetzner',
  16,
  32768, -- 32GB
  200,
  'active',
  2800, -- €28/mo
  'nbg1'
);

-- ============================================================================
-- Views for Common Queries
-- ============================================================================

-- View: Current resource allocation per VPS
CREATE VIEW IF NOT EXISTS vps_allocation AS
SELECT
  v.hostname,
  v.total_cpu_cores,
  v.total_memory_mb,
  v.total_storage_gb,
  v.allocated_cpu_cores,
  v.allocated_memory_mb,
  v.allocated_storage_gb,
  ROUND((v.allocated_cpu_cores * 1.0 / v.total_cpu_cores) * 100, 2) AS cpu_utilization_percent,
  ROUND((v.allocated_memory_mb * 1.0 / v.total_memory_mb) * 100, 2) AS memory_utilization_percent,
  COUNT(t.tenant_id) AS tenant_count
FROM vps_inventory v
LEFT JOIN tenants t ON t.vps_hostname = v.hostname AND t.status = 'active'
GROUP BY v.hostname;

-- View: Monthly revenue per tier
CREATE VIEW IF NOT EXISTS revenue_by_tier AS
SELECT
  tier,
  COUNT(*) AS tenant_count,
  SUM(monthly_price_cents) AS total_monthly_revenue_cents,
  AVG(monthly_price_cents) AS avg_monthly_price_cents
FROM tenants
WHERE status = 'active'
GROUP BY tier;

-- View: Recent usage by tenant (last 24 hours)
CREATE VIEW IF NOT EXISTS recent_tenant_usage AS
SELECT
  tu.tenant_id,
  t.company_name,
  t.tier,
  AVG(tu.cpu_usage_percent) AS avg_cpu_percent,
  AVG(tu.memory_usage_mb) AS avg_memory_mb,
  MAX(tu.storage_usage_gb) AS current_storage_gb,
  SUM(tu.total_tokens) AS total_tokens_24h,
  SUM(tu.estimated_cost_cents) AS estimated_cost_cents_24h
FROM tenant_usage tu
JOIN tenants t ON t.tenant_id = tu.tenant_id
WHERE tu.timestamp >= datetime('now', '-24 hours')
GROUP BY tu.tenant_id;

-- View: Unresolved alerts
CREATE VIEW IF NOT EXISTS unresolved_alerts AS
SELECT
  a.alert_id,
  a.tenant_id,
  t.company_name,
  a.alert_type,
  a.severity,
  a.message,
  a.timestamp,
  a.current_value,
  a.threshold_value
FROM alerts a
JOIN tenants t ON t.tenant_id = a.tenant_id
WHERE a.resolved_at IS NULL
ORDER BY a.severity DESC, a.timestamp DESC;

-- ============================================================================
-- Triggers for Data Integrity
-- ============================================================================

-- Trigger: Update VPS allocation when tenant is provisioned
CREATE TRIGGER IF NOT EXISTS update_vps_allocation_on_provision
AFTER INSERT ON tenants
WHEN NEW.status = 'active'
BEGIN
  UPDATE vps_inventory
  SET
    allocated_cpu_cores = allocated_cpu_cores + NEW.cpu_limit_cores,
    allocated_memory_mb = allocated_memory_mb + NEW.memory_limit_mb,
    allocated_storage_gb = allocated_storage_gb + NEW.storage_limit_gb
  WHERE hostname = NEW.vps_hostname;
END;

-- Trigger: Update VPS allocation when tenant is deleted/suspended
CREATE TRIGGER IF NOT EXISTS update_vps_allocation_on_delete
AFTER UPDATE ON tenants
WHEN OLD.status = 'active' AND NEW.status IN ('canceled', 'suspended')
BEGIN
  UPDATE vps_inventory
  SET
    allocated_cpu_cores = allocated_cpu_cores - OLD.cpu_limit_cores,
    allocated_memory_mb = allocated_memory_mb - OLD.memory_limit_mb,
    allocated_storage_gb = allocated_storage_gb - OLD.storage_limit_gb
  WHERE hostname = OLD.vps_hostname;
END;

-- Trigger: Audit log on tenant status change
CREATE TRIGGER IF NOT EXISTS audit_tenant_status_change
AFTER UPDATE ON tenants
WHEN OLD.status != NEW.status
BEGIN
  INSERT INTO audit_log (tenant_id, action, actor_type, metadata)
  VALUES (
    NEW.tenant_id,
    CASE NEW.status
      WHEN 'active' THEN 'tenant_reactivated'
      WHEN 'suspended' THEN 'tenant_suspended'
      WHEN 'canceled' THEN 'tenant_deleted'
      ELSE 'tenant_updated'
    END,
    'system',
    json_object(
      'old_status', OLD.status,
      'new_status', NEW.status
    )
  );
END;

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Already created inline above, but listed here for reference:
-- - idx_tenants_tier
-- - idx_tenants_status
-- - idx_tenants_stripe_customer
-- - idx_tenants_vps
-- - idx_tenant_usage_lookup
-- - idx_tenant_usage_timestamp
-- - idx_billing_events_tenant
-- - idx_billing_events_type
-- - idx_billing_events_stripe
-- - idx_audit_log_tenant
-- - idx_audit_log_action
-- - idx_audit_log_timestamp
-- - idx_alerts_tenant
-- - idx_alerts_unresolved
-- - idx_alerts_severity
-- - idx_vps_status
-- - idx_vps_provider
-- - idx_pattern_contributions_tenant
-- - idx_pattern_contributions_hash
-- - idx_pattern_contributions_accepted
-- - idx_pattern_contributions_type
-- - idx_admin_users_email
-- - idx_admin_users_status
