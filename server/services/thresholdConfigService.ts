import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface TradingThresholds {
  maxOrderSize: number;
  minOrderSize: number;
  maxLeverage: number;
  minMarginLevel: number;
}

interface RiskThresholds {
  maxDailyLoss: number;
  maxPositionSize: number;
  maxOpenPositions: number;
}

interface ExecutionThresholds {
  maxSlippage: number;
  minExecutionTime: number;
  maxExecutionTime: number;
}

interface ThresholdConfig {
  trading: TradingThresholds;
  risk: RiskThresholds;
  execution: ExecutionThresholds;
}

export class ThresholdConfigManager {
  private configCache = new Map<string, ThresholdConfig>();
  private defaultConfig: ThresholdConfig = {
    trading: {
      maxOrderSize: 1000,
      minOrderSize: 0.01,
      maxLeverage: 10,
      minMarginLevel: 0.5
    },
    risk: {
      maxDailyLoss: 1000,
      maxPositionSize: 5000,
      maxOpenPositions: 10
    },
    execution: {
      maxSlippage: 0.01,
      minExecutionTime: 100,
      maxExecutionTime: 5000
    }
  };

  loadTenantConfig(tenantId: string): ThresholdConfig {
    try {
      // Check cache first
      if (this.configCache.has(tenantId)) {
        return this.configCache.get(tenantId)!;
      }

      // Try to load tenant-specific config
      const configPath = path.join(
        process.cwd(),
        'config',
        'tenants',
        `${tenantId}.yaml`
      );

      if (!fs.existsSync(configPath)) {
        return this.defaultConfig;
      }

      const configFile = fs.readFileSync(configPath, 'utf8');
      const config = yaml.load(configFile) as ThresholdConfig;

      // Validate config
      this.validateConfig(config);

      // Cache the config
      this.configCache.set(tenantId, config);
      return config;
    } catch (error) {
      console.error(`Error loading config for tenant ${tenantId}:`, error);
      return this.defaultConfig;
    }
  }

  validateConfig(config: any): asserts config is ThresholdConfig {
    // Validate trading thresholds
    if (!config.trading ||
        typeof config.trading.maxOrderSize !== 'number' ||
        typeof config.trading.minOrderSize !== 'number' ||
        typeof config.trading.maxLeverage !== 'number' ||
        typeof config.trading.minMarginLevel !== 'number') {
      throw new Error('Invalid trading configuration');
    }

    // Validate risk thresholds
    if (!config.risk ||
        typeof config.risk.maxDailyLoss !== 'number' ||
        typeof config.risk.maxPositionSize !== 'number' ||
        typeof config.risk.maxOpenPositions !== 'number') {
      throw new Error('Invalid risk configuration');
    }

    // Validate execution thresholds
    if (!config.execution ||
        typeof config.execution.maxSlippage !== 'number' ||
        typeof config.execution.minExecutionTime !== 'number' ||
        typeof config.execution.maxExecutionTime !== 'number') {
      throw new Error('Invalid execution configuration');
    }
  }

  updateTenantConfig(tenantId: string, newConfig: ThresholdConfig): boolean {
    try {
      // Validate new config
      this.validateConfig(newConfig);

      // Save to file
      const configPath = path.join(
        process.cwd(),
        'config',
        'tenants',
        `${tenantId}.yaml`
      );

      // Ensure directory exists
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write config
      fs.writeFileSync(configPath, yaml.dump(newConfig));

      // Update cache
      this.configCache.set(tenantId, newConfig);
      return true;
    } catch (error) {
      console.error(`Error updating config for tenant ${tenantId}:`, error);
      return false;
    }
  }

  clearCache(tenantId?: string): void {
    if (tenantId) {
      this.configCache.delete(tenantId);
    } else {
      this.configCache.clear();
    }
  }

  getDefaultConfig(): ThresholdConfig {
    return this.defaultConfig;
  }

  getAllTenantConfigs(): Map<string, ThresholdConfig> {
    return new Map(this.configCache);
  }

  // Helper methods for specific threshold checks
  isOrderSizeValid(tenantId: string, orderSize: number): boolean {
    const config = this.loadTenantConfig(tenantId);
    return orderSize >= config.trading.minOrderSize && orderSize <= config.trading.maxOrderSize;
  }

  isLeverageValid(tenantId: string, leverage: number): boolean {
    const config = this.loadTenantConfig(tenantId);
    return leverage <= config.trading.maxLeverage;
  }

  isDailyLossValid(tenantId: string, currentLoss: number): boolean {
    const config = this.loadTenantConfig(tenantId);
    return currentLoss <= config.risk.maxDailyLoss;
  }

  isPositionSizeValid(tenantId: string, positionSize: number): boolean {
    const config = this.loadTenantConfig(tenantId);
    return positionSize <= config.risk.maxPositionSize;
  }

  canOpenNewPosition(tenantId: string, currentOpenPositions: number): boolean {
    const config = this.loadTenantConfig(tenantId);
    return currentOpenPositions < config.risk.maxOpenPositions;
  }

  isSlippageValid(tenantId: string, slippage: number): boolean {
    const config = this.loadTenantConfig(tenantId);
    return slippage <= config.execution.maxSlippage;
  }
}

export const thresholdConfigManager = new ThresholdConfigManager();
export default thresholdConfigManager; 