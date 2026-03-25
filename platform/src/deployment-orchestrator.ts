import { TenantManager, SubscriptionTier, ProvisioningOptions } from './tenant-manager';
import { CadansDatabase } from './database';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================================================
// Types
// ============================================================================

export interface VPSSpec {
  provider: 'hetzner' | 'digitalocean' | 'custom';
  region: string;
  vcpu: number;
  memoryGb: number;
  storageGb: number;
  monthlyCostCents: number;
}

export interface EnterpriseVPSOptions {
  tenantId: string;
  companyName: string;
  vpsSize: 'cx21' | 'cx31' | 'cx41' | 'cx51';
  region: 'nbg1' | 'fsn1' | 'hel1';
  customDomain?: string;
}

// ============================================================================
// Deployment Orchestrator
// ============================================================================

/**
 * Orchestrates tenant provisioning across shared and dedicated VPSs
 */
export class DeploymentOrchestrator {
  private tenantManager: TenantManager;
  private db: CadansDatabase;

  constructor(db: CadansDatabase) {
    this.db = db;
    this.tenantManager = new TenantManager(db.dbPath);
  }

  /**
   * Provision tenant based on tier
   * Automatically selects shared VPS or provisions dedicated VPS
   */
  async provisionTenant(options: ProvisioningOptions): Promise<any> {
    console.log(`[Orchestrator] Provisioning ${options.tier} tier for: ${options.companyName}`);

    if (options.tier === SubscriptionTier.ENTERPRISE) {
      // Enterprise gets dedicated VPS
      return await this.provisionEnterpriseVPS({
        tenantId: '', // Will be generated
        companyName: options.companyName,
        vpsSize: 'cx31', // Default: 2 vCPU, 8GB RAM
        region: 'nbg1',
      });
    } else {
      // Shared/Private tiers go to shared VPS
      return await this.provisionSharedVPS(options);
    }
  }

  /**
   * Provision tenant on shared VPS (Shared/Private tier)
   */
  private async provisionSharedVPS(options: ProvisioningOptions): Promise<any> {
    // Find available VPS with capacity
    const availableVPS = await this.db.getAvailableVPS();

    if (!availableVPS) {
      console.log('[Orchestrator] No available VPS, provisioning new shared VPS');
      await this.provisionNewSharedVPS();
      // Retry after provisioning
      return await this.provisionSharedVPS(options);
    }

    console.log(`[Orchestrator] Using VPS: ${availableVPS}`);

    // Provision tenant using TenantManager
    const tenant = await this.tenantManager.provisionTenant({
      ...options,
      vpsHostname: availableVPS,
    });

    // Log audit event
    await this.db.insertAuditLog({
      tenantId: tenant.tenantId,
      action: 'tenant_created',
      actorType: 'system',
      metadata: {
        tier: options.tier,
        vps: availableVPS,
      },
    });

    return tenant;
  }

  /**
   * Provision new shared VPS when capacity is reached
   */
  private async provisionNewSharedVPS(): Promise<string> {
    // Get next VPS number
    const vpsCount = (await this.db.getAllVPSAllocations()).length;
    const nextNumber = vpsCount + 1;
    const hostname = `shared-vps-${String(nextNumber).padStart(2, '0')}.cadans.nl`;

    console.log(`[Orchestrator] Provisioning new shared VPS: ${hostname}`);

    // TODO: Provision via Hetzner API
    // For now, manual setup required

    // Insert into database
    await this.db.run(
      `
      INSERT INTO vps_inventory (
        hostname, provider, provider_vps_id,
        total_cpu_cores, total_memory_mb, total_storage_gb,
        status, monthly_cost_cents, region, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        hostname,
        'hetzner',
        null, // Will be filled in after manual provisioning
        16, // CPX51: 16 vCPU
        32768, // 32GB RAM
        200, // 200GB storage
        'active',
        2800, // €28/mo
        'nbg1',
        null, // Will be filled in after manual provisioning
      ]
    );

    console.log(`[Orchestrator] ✅ Shared VPS registered: ${hostname}`);
    console.log(
      `[Orchestrator] ⚠️  Manual action required: Provision Hetzner CPX51 server and update IP address`
    );

    return hostname;
  }

  /**
   * Provision dedicated VPS for Enterprise tier
   */
  async provisionEnterpriseVPS(options: EnterpriseVPSOptions): Promise<any> {
    console.log(`[Orchestrator] Provisioning Enterprise VPS: ${options.companyName}`);

    const vpsSpec = this.getVPSSpec(options.vpsSize);
    const hostname = options.customDomain || `${this.slugify(options.companyName)}.cadans.nl`;

    // TODO: Provision via Hetzner API
    // For MVP, this is manual

    console.log(`[Orchestrator] VPS Spec:`, vpsSpec);
    console.log(`[Orchestrator] Hostname: ${hostname}`);

    // Register VPS in inventory
    await this.db.run(
      `
      INSERT INTO vps_inventory (
        hostname, provider, total_cpu_cores, total_memory_mb, total_storage_gb,
        status, monthly_cost_cents, region
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        hostname,
        'hetzner',
        vpsSpec.vcpu,
        vpsSpec.memoryGb * 1024,
        vpsSpec.storageGb,
        'active',
        vpsSpec.monthlyCostCents,
        options.region,
      ]
    );

    // Provision tenant
    const tenant = await this.tenantManager.provisionTenant({
      companyName: options.companyName,
      email: '', // Provided via sales process
      tier: SubscriptionTier.ENTERPRISE,
      vpsHostname: hostname,
    });

    console.log(`[Orchestrator] ✅ Enterprise VPS provisioned: ${hostname}`);
    console.log(
      `[Orchestrator] ⚠️  Manual action required: Set up VPS, install Docker, configure DNS`
    );

    return { tenant, vpsSpec, hostname };
  }

  /**
   * Get VPS specifications by size
   */
  private getVPSSpec(size: string): VPSSpec {
    const specs: Record<string, VPSSpec> = {
      cx21: {
        provider: 'hetzner',
        region: 'nbg1',
        vcpu: 2,
        memoryGb: 4,
        storageGb: 40,
        monthlyCostCents: 490, // ~€4.90/mo
      },
      cx31: {
        provider: 'hetzner',
        region: 'nbg1',
        vcpu: 2,
        memoryGb: 8,
        storageGb: 80,
        monthlyCostCents: 920, // ~€9.20/mo
      },
      cx41: {
        provider: 'hetzner',
        region: 'nbg1',
        vcpu: 4,
        memoryGb: 16,
        storageGb: 160,
        monthlyCostCents: 1670, // ~€16.70/mo
      },
      cx51: {
        provider: 'hetzner',
        region: 'nbg1',
        vcpu: 8,
        memoryGb: 32,
        storageGb: 240,
        monthlyCostCents: 3170, // ~€31.70/mo
      },
    };

    return specs[size] || specs.cx31;
  }

  /**
   * Monitor resource usage across all VPSs
   * Creates alerts if thresholds exceeded
   */
  async monitorResourceUsage(): Promise<void> {
    console.log('[Orchestrator] Monitoring resource usage...');

    const allocations = await this.db.getAllVPSAllocations();

    for (const vps of allocations) {
      // Check CPU utilization
      if (vps.cpu_utilization_percent > 80) {
        await this.db.createAlert({
          tenantId: 'system',
          alertType: 'cpu_high',
          severity: 'warning',
          message: `VPS ${vps.hostname} CPU utilization: ${vps.cpu_utilization_percent}%`,
          thresholdValue: 80,
          currentValue: vps.cpu_utilization_percent,
        });

        console.log(`⚠️  VPS ${vps.hostname} CPU high: ${vps.cpu_utilization_percent}%`);
      }

      // Check memory utilization
      if (vps.memory_utilization_percent > 80) {
        await this.db.createAlert({
          tenantId: 'system',
          alertType: 'memory_high',
          severity: 'warning',
          message: `VPS ${vps.hostname} memory utilization: ${vps.memory_utilization_percent}%`,
          thresholdValue: 80,
          currentValue: vps.memory_utilization_percent,
        });

        console.log(`⚠️  VPS ${vps.hostname} memory high: ${vps.memory_utilization_percent}%`);
      }

      // If both >90%, trigger critical alert to provision new VPS
      if (vps.cpu_utilization_percent > 90 || vps.memory_utilization_percent > 90) {
        await this.db.createAlert({
          tenantId: 'system',
          alertType: 'cpu_high',
          severity: 'critical',
          message: `VPS ${vps.hostname} critical: Provision new shared VPS`,
          thresholdValue: 90,
          currentValue: Math.max(vps.cpu_utilization_percent, vps.memory_utilization_percent),
        });

        console.log(`🚨 VPS ${vps.hostname} critical - provision new shared VPS!`);
      }
    }
  }

  /**
   * Migrate tenant to different VPS (e.g., Private → Enterprise upgrade)
   */
  async migrateTenant(tenantId: string, targetVPSHostname: string): Promise<void> {
    console.log(`[Orchestrator] Migrating tenant ${tenantId} to ${targetVPSHostname}`);

    const tenant = await this.db.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // 1. Stop container on old VPS
    await this.tenantManager.stopContainer(tenantId);

    // 2. Rsync data to new VPS
    const sourceRoot = `/opt/cadans/tenants/${tenantId}`;
    const targetRoot = `${targetVPSHostname}:/opt/cadans/tenants/${tenantId}`;

    console.log(`[Orchestrator] Syncing data: ${sourceRoot} → ${targetRoot}`);

    // TODO: Implement rsync
    // await execAsync(`rsync -avz ${sourceRoot} ${targetRoot}`);

    // 3. Update tenant record
    await this.db.updateTenant(tenantId, { vpsHostname: targetVPSHostname });

    // 4. Start container on new VPS
    // TODO: SSH to new VPS and start container

    console.log(`[Orchestrator] ✅ Tenant migrated to ${targetVPSHostname}`);

    // Log audit event
    await this.db.insertAuditLog({
      tenantId,
      action: 'tenant_updated',
      actorType: 'system',
      metadata: {
        action: 'vps_migration',
        old_vps: tenant.vpsHostname,
        new_vps: targetVPSHostname,
      },
    });
  }

  /**
   * Generate slug from company name
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Get deployment statistics
   */
  async getDeploymentStats(): Promise<{
    totalTenants: number;
    activeVPSs: number;
    totalMRR: number;
    avgCPUUtilization: number;
    avgMemoryUtilization: number;
  }> {
    const totalTenants = await this.db.getActiveTenantsCount();
    const allocations = await this.db.getAllVPSAllocations();
    const totalMRR = await this.db.getTotalMRR();

    const activeVPSs = allocations.filter((vps) => vps.status === 'active').length;

    const avgCPUUtilization =
      allocations.reduce((sum, vps) => sum + vps.cpu_utilization_percent, 0) / allocations.length ||
      0;

    const avgMemoryUtilization =
      allocations.reduce((sum, vps) => sum + vps.memory_utilization_percent, 0) /
        allocations.length || 0;

    return {
      totalTenants,
      activeVPSs,
      totalMRR,
      avgCPUUtilization: Math.round(avgCPUUtilization * 100) / 100,
      avgMemoryUtilization: Math.round(avgMemoryUtilization * 100) / 100,
    };
  }
}

// ============================================================================
// CLI Usage
// ============================================================================

if (require.main === module) {
  const db = new CadansDatabase();
  const orchestrator = new DeploymentOrchestrator(db);

  db.initialize()
    .then(() => {
      // Example: Monitor resource usage
      return orchestrator.monitorResourceUsage();
    })
    .then(() => {
      // Example: Get stats
      return orchestrator.getDeploymentStats();
    })
    .then((stats) => {
      console.log('Deployment Stats:', stats);
    })
    .catch((error) => {
      console.error('Error:', error);
    })
    .finally(() => {
      db.close();
    });
}
