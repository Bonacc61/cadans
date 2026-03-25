import * as sqlite3 from 'sqlite3';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

// ============================================================================
// Database Wrapper
// ============================================================================

export class CadansDatabase {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor(dbPath: string = '/root/cadans/platform/db/tenants.db') {
    this.dbPath = dbPath;
  }

  /**
   * Initialize database connection and create schema
   */
  async initialize(): Promise<void> {
    // Ensure directory exists
    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

    // Open database
    this.db = new sqlite3.Database(this.dbPath);

    // Enable foreign keys
    await this.run('PRAGMA foreign_keys = ON');

    // Load schema
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');

    // Execute schema (split by semicolon and run each statement)
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      await this.run(statement);
    }

    console.log('[CadansDB] Database initialized:', this.dbPath);
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      this.db!.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Run a SQL statement (INSERT, UPDATE, DELETE)
   */
  async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  /**
   * Get a single row
   */
  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  }

  /**
   * Get all rows
   */
  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  /**
   * Begin transaction
   */
  async beginTransaction(): Promise<void> {
    await this.run('BEGIN TRANSACTION');
  }

  /**
   * Commit transaction
   */
  async commit(): Promise<void> {
    await this.run('COMMIT');
  }

  /**
   * Rollback transaction
   */
  async rollback(): Promise<void> {
    await this.run('ROLLBACK');
  }

  // ========================================================================
  // Tenant Operations
  // ========================================================================

  async insertTenant(tenant: any): Promise<void> {
    const sql = `
      INSERT INTO tenants (
        tenant_id, company_name, tier, container_id, vps_hostname, status,
        stripe_customer_id, stripe_subscription_id, monthly_price_cents,
        cpu_limit_cores, memory_limit_mb, storage_limit_gb,
        pattern_contribution_consent, consent_timestamp, consent_ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.run(sql, [
      tenant.tenantId,
      tenant.companyName,
      tenant.tier,
      tenant.containerId || null,
      tenant.vpsHostname,
      tenant.status,
      tenant.stripeCustomerId || null,
      tenant.stripeSubscriptionId || null,
      tenant.monthlyPriceCents,
      tenant.cpuLimitCores,
      tenant.memoryLimitMb,
      tenant.storageLimitGb,
      tenant.patternContributionConsent ? 1 : 0,
      tenant.consentTimestamp?.toISOString() || null,
      tenant.consentIpAddress || null,
    ]);
  }

  async updateTenant(tenantId: string, updates: Partial<any>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    // Build SET clause dynamically
    for (const [key, value] of Object.entries(updates)) {
      // Convert camelCase to snake_case
      const dbKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      fields.push(`${dbKey} = ?`);
      values.push(value);
    }

    values.push(tenantId);

    const sql = `UPDATE tenants SET ${fields.join(', ')} WHERE tenant_id = ?`;
    await this.run(sql, values);
  }

  async getTenant(tenantId: string): Promise<any | undefined> {
    const row = await this.get('SELECT * FROM tenants WHERE tenant_id = ?', [tenantId]);
    if (!row) return undefined;

    // Convert snake_case to camelCase and parse dates
    return this.rowToTenant(row);
  }

  async getTenantByStripeCustomer(stripeCustomerId: string): Promise<any | undefined> {
    const row = await this.get('SELECT * FROM tenants WHERE stripe_customer_id = ?', [
      stripeCustomerId,
    ]);
    if (!row) return undefined;
    return this.rowToTenant(row);
  }

  async listTenants(filter?: { tier?: string; status?: string }): Promise<any[]> {
    let sql = 'SELECT * FROM tenants WHERE 1=1';
    const params: any[] = [];

    if (filter?.tier) {
      sql += ' AND tier = ?';
      params.push(filter.tier);
    }

    if (filter?.status) {
      sql += ' AND status = ?';
      params.push(filter.status);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await this.all(sql, params);
    return rows.map((row) => this.rowToTenant(row));
  }

  async deleteTenant(tenantId: string): Promise<void> {
    await this.run('DELETE FROM tenants WHERE tenant_id = ?', [tenantId]);
  }

  private rowToTenant(row: any): any {
    return {
      tenantId: row.tenant_id,
      companyName: row.company_name,
      tier: row.tier,
      containerId: row.container_id,
      vpsHostname: row.vps_hostname,
      status: row.status,
      createdAt: new Date(row.created_at),
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      monthlyPriceCents: row.monthly_price_cents,
      cpuLimitCores: row.cpu_limit_cores,
      memoryLimitMb: row.memory_limit_mb,
      storageLimitGb: row.storage_limit_gb,
      patternContributionConsent: row.pattern_contribution_consent === 1,
      consentTimestamp: row.consent_timestamp ? new Date(row.consent_timestamp) : undefined,
      consentIpAddress: row.consent_ip_address,
      dataDeletionRequestedAt: row.data_deletion_requested_at
        ? new Date(row.data_deletion_requested_at)
        : undefined,
    };
  }

  // ========================================================================
  // Tenant Usage Operations
  // ========================================================================

  async insertUsage(usage: any): Promise<void> {
    const sql = `
      INSERT INTO tenant_usage (
        tenant_id, timestamp, cpu_usage_percent, memory_usage_mb, storage_usage_gb,
        total_tokens, input_tokens, output_tokens, estimated_cost_cents,
        messages_sent, messages_received
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.run(sql, [
      usage.tenantId,
      usage.timestamp?.toISOString() || new Date().toISOString(),
      usage.cpuUsagePercent || 0,
      usage.memoryUsageMb || 0,
      usage.storageUsageGb || 0,
      usage.totalTokens || 0,
      usage.inputTokens || 0,
      usage.outputTokens || 0,
      usage.estimatedCostCents || 0,
      usage.messagesSent || 0,
      usage.messagesReceived || 0,
    ]);
  }

  async getRecentUsage(tenantId: string, hours: number = 24): Promise<any[]> {
    const sql = `
      SELECT * FROM tenant_usage
      WHERE tenant_id = ? AND timestamp >= datetime('now', '-${hours} hours')
      ORDER BY timestamp DESC
    `;

    const rows = await this.all(sql, [tenantId]);
    return rows.map((row) => ({
      tenantId: row.tenant_id,
      timestamp: new Date(row.timestamp),
      cpuUsagePercent: row.cpu_usage_percent,
      memoryUsageMb: row.memory_usage_mb,
      storageUsageGb: row.storage_usage_gb,
      totalTokens: row.total_tokens,
      estimatedCostCents: row.estimated_cost_cents,
    }));
  }

  async getMonthlyTokens(tenantId: string): Promise<number> {
    const sql = `
      SELECT SUM(total_tokens) as total
      FROM tenant_usage
      WHERE tenant_id = ?
        AND timestamp >= datetime('now', 'start of month')
    `;

    const result = await this.get<{ total: number }>(sql, [tenantId]);
    return result?.total || 0;
  }

  async getMonthlyCost(tenantId: string): Promise<number> {
    const sql = `
      SELECT SUM(estimated_cost_cents) as total
      FROM tenant_usage
      WHERE tenant_id = ?
        AND timestamp >= datetime('now', 'start of month')
    `;

    const result = await this.get<{ total: number }>(sql, [tenantId]);
    return result?.total || 0;
  }

  // ========================================================================
  // Audit Log Operations
  // ========================================================================

  async insertAuditLog(entry: {
    tenantId?: string;
    action: string;
    actorType: string;
    actorId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }): Promise<void> {
    const sql = `
      INSERT INTO audit_log (
        tenant_id, action, actor_type, actor_id, ip_address, user_agent, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.run(sql, [
      entry.tenantId || null,
      entry.action,
      entry.actorType,
      entry.actorId || null,
      entry.ipAddress || null,
      entry.userAgent || null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
    ]);
  }

  async getAuditLog(tenantId: string, limit: number = 100): Promise<any[]> {
    const sql = `
      SELECT * FROM audit_log
      WHERE tenant_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;

    return await this.all(sql, [tenantId, limit]);
  }

  // ========================================================================
  // VPS Inventory Operations
  // ========================================================================

  async getVPSAllocation(hostname: string): Promise<any> {
    const sql = 'SELECT * FROM vps_allocation WHERE hostname = ?';
    return await this.get(sql, [hostname]);
  }

  async getAllVPSAllocations(): Promise<any[]> {
    return await this.all('SELECT * FROM vps_allocation');
  }

  async getAvailableVPS(): Promise<string | null> {
    const sql = `
      SELECT hostname FROM vps_allocation
      WHERE status = 'active'
        AND cpu_utilization_percent < 80
        AND memory_utilization_percent < 80
      ORDER BY tenant_count ASC
      LIMIT 1
    `;

    const result = await this.get<{ hostname: string }>(sql);
    return result?.hostname || null;
  }

  // ========================================================================
  // Alerts Operations
  // ========================================================================

  async createAlert(alert: {
    tenantId: string;
    alertType: string;
    severity: string;
    message: string;
    thresholdValue?: number;
    currentValue?: number;
  }): Promise<void> {
    const sql = `
      INSERT INTO alerts (
        tenant_id, alert_type, severity, message, threshold_value, current_value
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    await this.run(sql, [
      alert.tenantId,
      alert.alertType,
      alert.severity,
      alert.message,
      alert.thresholdValue || null,
      alert.currentValue || null,
    ]);
  }

  async resolveAlert(alertId: number): Promise<void> {
    const sql = `UPDATE alerts SET resolved_at = CURRENT_TIMESTAMP WHERE alert_id = ?`;
    await this.run(sql, [alertId]);
  }

  async getUnresolvedAlerts(): Promise<any[]> {
    return await this.all('SELECT * FROM unresolved_alerts');
  }

  // ========================================================================
  // Analytics Queries
  // ========================================================================

  async getRevenueByTier(): Promise<any[]> {
    return await this.all('SELECT * FROM revenue_by_tier');
  }

  async getTotalMRR(): Promise<number> {
    const sql = `
      SELECT SUM(monthly_price_cents) as total
      FROM tenants
      WHERE status = 'active'
    `;

    const result = await this.get<{ total: number }>(sql);
    return result?.total || 0;
  }

  async getActiveTenantsCount(): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM tenants WHERE status = 'active'`;
    const result = await this.get<{ count: number }>(sql);
    return result?.count || 0;
  }

  async getChurnRate(days: number = 30): Promise<number> {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM tenants WHERE status = 'canceled' AND created_at >= datetime('now', '-${days} days')) * 1.0 /
        (SELECT COUNT(*) FROM tenants WHERE created_at >= datetime('now', '-${days} days'))
      as churn_rate
    `;

    const result = await this.get<{ churn_rate: number }>(sql);
    return result?.churn_rate || 0;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const db = new CadansDatabase();
