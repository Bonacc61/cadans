import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================================================
// Types
// ============================================================================

export enum SubscriptionTier {
  SHARED = 'shared',
  PRIVATE = 'private',
  ENTERPRISE = 'enterprise',
}

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELED = 'canceled',
  PROVISIONING = 'provisioning',
}

export interface Tenant {
  tenantId: string;
  companyName: string;
  tier: SubscriptionTier;
  containerId?: string;
  vpsHostname: string;
  status: TenantStatus;
  createdAt: Date;

  // Billing
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  monthlyPriceCents: number;

  // Resource allocation
  cpuLimitCores: number;
  memoryLimitMb: number;
  storageLimitGb: number;

  // GDPR compliance
  patternContributionConsent: boolean;
  consentTimestamp?: Date;
  consentIpAddress?: string;
  dataDeletionRequestedAt?: Date;
}

export interface ResourceLimits {
  cpuLimitCores: number;
  memoryLimitMb: number;
  storageLimitGb: number;
}

export interface TenantUsage {
  tenantId: string;
  timestamp: Date;
  cpuUsagePercent: number;
  memoryUsageMb: number;
  storageUsageGb: number;
  totalTokens: number;
  estimatedCostCents: number;
}

export interface ProvisioningOptions {
  companyName: string;
  email: string;
  tier: SubscriptionTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  vpsHostname?: string;
  patternContributionConsent?: boolean;
  consentIpAddress?: string;
}

export interface DeletionOptions {
  reason: 'customer_request' | 'subscription_canceled' | 'payment_failed';
  retentionDays: number;
  exportData?: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

const TIER_CONFIG: Record<SubscriptionTier, ResourceLimits & { priceCents: number }> = {
  [SubscriptionTier.SHARED]: {
    cpuLimitCores: 1.0,
    memoryLimitMb: 1024,
    storageLimitGb: 5,
    priceCents: 4900, // €49/mo
  },
  [SubscriptionTier.PRIVATE]: {
    cpuLimitCores: 1.5,
    memoryLimitMb: 2048,
    storageLimitGb: 10,
    priceCents: 9900, // €99/mo
  },
  [SubscriptionTier.ENTERPRISE]: {
    cpuLimitCores: 4.0,
    memoryLimitMb: 8192,
    storageLimitGb: 100,
    priceCents: 49900, // €499/mo
  },
};

const PATHS = {
  tenantsRoot: '/opt/cadans/tenants',
  deletedRoot: '/opt/cadans/deleted',
  dockerCompose: '/root/cadans/platform/docker/docker-compose.shared.yml',
  nanoClawSource: '/root/NanoClaw',
};

// ============================================================================
// Tenant Manager
// ============================================================================

export class TenantManager {
  private dbPath: string;

  constructor(dbPath: string = '/root/cadans/platform/db/tenants.db') {
    this.dbPath = dbPath;
  }

  /**
   * Provision a new tenant (Shared/Private tier)
   * Creates directory structure, Docker container, and initializes NanoClaw
   */
  async provisionTenant(options: ProvisioningOptions): Promise<Tenant> {
    const tenantId = randomUUID();
    const config = TIER_CONFIG[options.tier];

    console.log(`[TenantManager] Provisioning tenant: ${options.companyName} (${options.tier})`);

    // 1. Create tenant record
    const tenant: Tenant = {
      tenantId,
      companyName: options.companyName,
      tier: options.tier,
      vpsHostname: options.vpsHostname || 'shared-vps-01.cadans.nl',
      status: TenantStatus.PROVISIONING,
      createdAt: new Date(),
      stripeCustomerId: options.stripeCustomerId,
      stripeSubscriptionId: options.stripeSubscriptionId,
      monthlyPriceCents: config.priceCents,
      cpuLimitCores: config.cpuLimitCores,
      memoryLimitMb: config.memoryLimitMb,
      storageLimitGb: config.storageLimitGb,
      patternContributionConsent: options.patternContributionConsent || false,
      consentTimestamp: options.patternContributionConsent ? new Date() : undefined,
      consentIpAddress: options.consentIpAddress,
    };

    try {
      // 2. Create directory structure
      await this.createTenantDirectories(tenantId);

      // 3. Initialize NanoClaw database and CLAUDE.md
      await this.initializeTenantData(tenantId, options.companyName);

      // 4. Generate docker-compose service definition
      const dockerService = this.generateDockerComposeService(tenant);
      await this.appendDockerService(dockerService);

      // 5. Start Docker container
      const containerId = await this.startContainer(tenantId);
      tenant.containerId = containerId;

      // 6. Update status to active
      tenant.status = TenantStatus.ACTIVE;

      // 7. Save to database
      await this.saveTenant(tenant);

      console.log(`[TenantManager] ✅ Tenant provisioned: ${tenantId} (container: ${containerId})`);

      return tenant;
    } catch (error) {
      console.error(`[TenantManager] ❌ Provisioning failed for ${tenantId}:`, error);
      tenant.status = TenantStatus.SUSPENDED;
      throw error;
    }
  }

  /**
   * Create directory structure for tenant
   */
  private async createTenantDirectories(tenantId: string): Promise<void> {
    const tenantRoot = path.join(PATHS.tenantsRoot, tenantId);

    const dirs = [
      tenantRoot,
      path.join(tenantRoot, 'groups'),
      path.join(tenantRoot, 'groups', 'global'),
      path.join(tenantRoot, 'credentials'),
      path.join(tenantRoot, 'logs'),
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true, mode: 0o755 });
    }

    console.log(`[TenantManager] Created directories for tenant: ${tenantId}`);
  }

  /**
   * Initialize NanoClaw database and CLAUDE.md for tenant
   */
  private async initializeTenantData(tenantId: string, companyName: string): Promise<void> {
    const groupPath = path.join(PATHS.tenantsRoot, tenantId, 'groups', 'global');

    // Create CLAUDE.md (group memory)
    const claudeMd = `# ${companyName} - NanoClaw Assistant

**Tenant ID:** ${tenantId}
**Created:** ${new Date().toISOString()}

## Context

You are the personal AI assistant for ${companyName}. Your role is to help with:
- Email management and drafting
- Calendar scheduling and meeting coordination
- Task tracking and reminders
- Document summarization
- Dutch business communication (formal and professional tone)

## Communication Style

- Professional but friendly
- Use "u" (formal you) in Dutch business contexts
- Be proactive with reminders and follow-ups
- Respect GDPR and privacy (never store PII unnecessarily)

## Knowledge Base

(This section will grow as you learn about ${companyName}'s business, contacts, and preferences)

`;

    await fs.writeFile(path.join(groupPath, 'CLAUDE.md'), claudeMd, 'utf-8');

    // Initialize empty nanoclaw.db (will be created by NanoClaw on first run)
    // Just ensure the directory is writable
    await fs.chmod(groupPath, 0o755);

    console.log(`[TenantManager] Initialized NanoClaw data for tenant: ${tenantId}`);
  }

  /**
   * Generate docker-compose service definition for tenant
   */
  private generateDockerComposeService(tenant: Tenant): string {
    const sanitizedId = tenant.tenantId.replace(/-/g, '');
    const containerName = `cadans-${sanitizedId.substring(0, 12)}`;

    return `
  ${containerName}:
    build:
      context: ${PATHS.nanoClawSource}
      dockerfile: ${path.join(__dirname, '../../docker/Dockerfile.tenant')}
    container_name: ${containerName}
    restart: unless-stopped

    deploy:
      resources:
        limits:
          cpus: '${tenant.cpuLimitCores}'
          memory: ${tenant.memoryLimitMb}M
        reservations:
          cpus: '${tenant.cpuLimitCores * 0.5}'
          memory: ${tenant.memoryLimitMb * 0.5}M

    volumes:
      - ${path.join(PATHS.tenantsRoot, tenant.tenantId, 'groups')}:/app/groups
      - ${path.join(PATHS.tenantsRoot, tenant.tenantId, 'credentials')}:/app/.credentials
      - ${path.join(PATHS.tenantsRoot, tenant.tenantId, 'logs')}:/app/logs

    environment:
      - TENANT_ID=${tenant.tenantId}
      - TIER=${tenant.tier}
      - COMPANY_NAME=${tenant.companyName}
      - DATABASE_PATH=/app/groups/global/nanoclaw.db
      - PATTERN_CONTRIBUTION=${tenant.patternContributionConsent}

    networks:
      - tenant-${sanitizedId.substring(0, 12)}

    healthcheck:
      test: ["CMD", "node", "-e", "process.exit(0)"]
      interval: 30s
      timeout: 10s
      retries: 3

    labels:
      - "cadans.tenant_id=${tenant.tenantId}"
      - "cadans.tier=${tenant.tier}"
      - "cadans.company=${tenant.companyName}"

networks:
  tenant-${sanitizedId.substring(0, 12)}:
    driver: bridge
`;
  }

  /**
   * Append docker-compose service to shared compose file
   */
  private async appendDockerService(serviceDefinition: string): Promise<void> {
    // Read current docker-compose file
    let composeContent = '';
    try {
      composeContent = await fs.readFile(PATHS.dockerCompose, 'utf-8');
    } catch (error) {
      // File doesn't exist, create base structure
      composeContent = `version: '3.8'\n\nservices:\n`;
    }

    // Append new service
    composeContent += serviceDefinition;

    await fs.writeFile(PATHS.dockerCompose, composeContent, 'utf-8');
    console.log(`[TenantManager] Updated docker-compose.yml`);
  }

  /**
   * Start Docker container for tenant
   */
  private async startContainer(tenantId: string): Promise<string> {
    const sanitizedId = tenantId.replace(/-/g, '');
    const containerName = `cadans-${sanitizedId.substring(0, 12)}`;

    try {
      // Start container using docker-compose
      await execAsync(`docker-compose -f ${PATHS.dockerCompose} up -d ${containerName}`);

      // Get container ID
      const { stdout } = await execAsync(`docker ps -q -f name=${containerName}`);
      const containerId = stdout.trim();

      if (!containerId) {
        throw new Error(`Container ${containerName} failed to start`);
      }

      console.log(`[TenantManager] Started container: ${containerName} (${containerId})`);
      return containerId;
    } catch (error) {
      console.error(`[TenantManager] Failed to start container for ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Stop and remove tenant container
   */
  async stopContainer(tenantId: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant.containerId) {
      console.warn(`[TenantManager] No container ID for tenant ${tenantId}`);
      return;
    }

    const sanitizedId = tenantId.replace(/-/g, '');
    const containerName = `cadans-${sanitizedId.substring(0, 12)}`;

    try {
      await execAsync(`docker-compose -f ${PATHS.dockerCompose} stop ${containerName}`);
      await execAsync(`docker-compose -f ${PATHS.dockerCompose} rm -f ${containerName}`);
      console.log(`[TenantManager] Stopped container: ${containerName}`);
    } catch (error) {
      console.error(`[TenantManager] Failed to stop container ${containerName}:`, error);
      throw error;
    }
  }

  /**
   * Suspend tenant (stop container, mark as suspended)
   */
  async suspendTenant(tenantId: string, reason: string): Promise<void> {
    console.log(`[TenantManager] Suspending tenant ${tenantId}: ${reason}`);

    await this.stopContainer(tenantId);

    const tenant = await this.getTenant(tenantId);
    tenant.status = TenantStatus.SUSPENDED;
    await this.saveTenant(tenant);

    console.log(`[TenantManager] ✅ Tenant suspended: ${tenantId}`);
  }

  /**
   * Reactivate suspended tenant
   */
  async reactivateTenant(tenantId: string): Promise<void> {
    console.log(`[TenantManager] Reactivating tenant ${tenantId}`);

    const containerId = await this.startContainer(tenantId);

    const tenant = await this.getTenant(tenantId);
    tenant.status = TenantStatus.ACTIVE;
    tenant.containerId = containerId;
    await this.saveTenant(tenant);

    console.log(`[TenantManager] ✅ Tenant reactivated: ${tenantId}`);
  }

  /**
   * Delete tenant (GDPR Article 17: Right to Erasure)
   */
  async deleteTenant(tenantId: string, options: DeletionOptions): Promise<void> {
    console.log(`[TenantManager] Deleting tenant ${tenantId} (reason: ${options.reason})`);

    const tenant = await this.getTenant(tenantId);

    // 1. Stop container
    await this.stopContainer(tenantId);

    // 2. Export data if requested (GDPR Article 20: Data Portability)
    if (options.exportData) {
      await this.exportTenantData(tenantId, {
        format: 'json',
        includeRawMessages: true,
      });
    }

    // 3. Move data to deleted directory (retention period)
    const tenantRoot = path.join(PATHS.tenantsRoot, tenantId);
    const deletedRoot = path.join(PATHS.deletedRoot, tenantId);

    await fs.mkdir(path.dirname(deletedRoot), { recursive: true });
    await execAsync(`mv ${tenantRoot} ${deletedRoot}`);

    // 4. Mark tenant as deleted
    tenant.status = TenantStatus.CANCELED;
    tenant.dataDeletionRequestedAt = new Date();
    await this.saveTenant(tenant);

    // 5. Schedule permanent deletion after retention period
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + options.retentionDays);

    console.log(
      `[TenantManager] ✅ Tenant ${tenantId} moved to deleted/ (permanent deletion: ${deletionDate.toISOString()})`
    );

    // TODO: Add cron job to permanently delete after retention period
    // For now, manual: rm -rf /opt/cadans/deleted/{tenantId}
  }

  /**
   * Export tenant data (GDPR Article 20: Data Portability)
   */
  async exportTenantData(
    tenantId: string,
    options: {
      format: 'json' | 'csv';
      includeRawMessages?: boolean;
      includePatterns?: boolean;
    }
  ): Promise<string> {
    const exportPath = `/tmp/tenant-export-${tenantId}-${Date.now()}.${options.format}`;
    const tenantRoot = path.join(PATHS.tenantsRoot, tenantId);

    // Copy entire groups/ directory
    const groupsPath = path.join(tenantRoot, 'groups');
    const exportDir = `/tmp/tenant-export-${tenantId}-${Date.now()}`;

    await execAsync(`cp -r ${groupsPath} ${exportDir}`);
    await execAsync(`cd ${exportDir} && zip -r ${exportPath} .`);
    await execAsync(`rm -rf ${exportDir}`);

    console.log(`[TenantManager] ✅ Exported tenant data: ${exportPath}`);
    return exportPath;
  }

  /**
   * Upgrade tenant tier (e.g., Shared → Private)
   */
  async upgradeTier(tenantId: string, newTier: SubscriptionTier): Promise<void> {
    console.log(`[TenantManager] Upgrading tenant ${tenantId} to ${newTier}`);

    const tenant = await this.getTenant(tenantId);
    const oldTier = tenant.tier;

    if (oldTier === newTier) {
      console.warn(`[TenantManager] Tenant ${tenantId} already on ${newTier}`);
      return;
    }

    // Update resource limits
    const newConfig = TIER_CONFIG[newTier];
    tenant.tier = newTier;
    tenant.cpuLimitCores = newConfig.cpuLimitCores;
    tenant.memoryLimitMb = newConfig.memoryLimitMb;
    tenant.storageLimitGb = newConfig.storageLimitGb;
    tenant.monthlyPriceCents = newConfig.priceCents;

    // If upgrading FROM Shared, disable pattern contribution
    if (oldTier === SubscriptionTier.SHARED && newTier !== SubscriptionTier.SHARED) {
      tenant.patternContributionConsent = false;
      console.log(`[TenantManager] Disabled pattern contribution (upgraded from Shared)`);
    }

    await this.saveTenant(tenant);

    // Restart container with new limits
    await this.stopContainer(tenantId);
    const containerId = await this.startContainer(tenantId);
    tenant.containerId = containerId;
    await this.saveTenant(tenant);

    console.log(`[TenantManager] ✅ Upgraded tenant ${tenantId}: ${oldTier} → ${newTier}`);
  }

  /**
   * Get tenant usage metrics
   */
  async getTenantUsage(tenantId: string): Promise<TenantUsage> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant.containerId) {
      throw new Error(`Tenant ${tenantId} has no active container`);
    }

    const sanitizedId = tenantId.replace(/-/g, '');
    const containerName = `cadans-${sanitizedId.substring(0, 12)}`;

    try {
      // Get Docker stats
      const { stdout } = await execAsync(
        `docker stats ${containerName} --no-stream --format "{{.CPUPerc}},{{.MemUsage}}"`
      );

      const [cpuPercent, memUsage] = stdout.trim().split(',');
      const cpuUsagePercent = parseFloat(cpuPercent.replace('%', ''));
      const memoryUsageMb = parseFloat(memUsage.split('/')[0].trim().replace('MiB', ''));

      // Get storage usage
      const tenantRoot = path.join(PATHS.tenantsRoot, tenantId);
      const { stdout: duOutput } = await execAsync(`du -sm ${tenantRoot} | cut -f1`);
      const storageUsageGb = parseFloat(duOutput.trim()) / 1024;

      // TODO: Get Claude API token usage from NanoClaw logs
      const totalTokens = 0; // Placeholder
      const estimatedCostCents = 0; // Placeholder

      return {
        tenantId,
        timestamp: new Date(),
        cpuUsagePercent,
        memoryUsageMb,
        storageUsageGb,
        totalTokens,
        estimatedCostCents,
      };
    } catch (error) {
      console.error(`[TenantManager] Failed to get usage for ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * List all tenants
   */
  async listTenants(filter?: { tier?: SubscriptionTier; status?: TenantStatus }): Promise<Tenant[]> {
    // TODO: Implement database query
    // For now, return mock data
    console.log(`[TenantManager] Listing tenants with filter:`, filter);
    return [];
  }

  /**
   * Get single tenant
   */
  async getTenant(tenantId: string): Promise<Tenant> {
    // TODO: Implement database query
    // For now, throw error
    throw new Error(`Tenant ${tenantId} not found (DB not implemented yet)`);
  }

  /**
   * Save tenant to database
   */
  private async saveTenant(tenant: Tenant): Promise<void> {
    // TODO: Implement database save
    // For now, just log
    console.log(`[TenantManager] Saving tenant to DB:`, {
      tenantId: tenant.tenantId,
      tier: tenant.tier,
      status: tenant.status,
    });
  }
}

// ============================================================================
// CLI Usage Example
// ============================================================================

if (require.main === module) {
  const manager = new TenantManager();

  // Example: Provision new tenant
  manager
    .provisionTenant({
      companyName: 'Acme BV',
      email: 'jan@acme.nl',
      tier: SubscriptionTier.SHARED,
      stripeCustomerId: 'cus_abc123',
      patternContributionConsent: true,
      consentIpAddress: '192.168.1.100',
    })
    .then((tenant) => {
      console.log('✅ Tenant provisioned:', tenant);
    })
    .catch((error) => {
      console.error('❌ Provisioning failed:', error);
    });
}
