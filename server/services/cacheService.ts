import Redis from 'ioredis';
import { dbManager } from '../db';

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  ttl?: number;
}

interface CacheItem<T = any> {
  value: T;
  expiresAt: number;
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  timestamp: number;
  indicators?: Record<string, number>;
}

interface Portfolio {
  positions: Array<{
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    pnl: number;
  }>;
  totalValue: number;
  totalPnL: number;
  lastUpdated: number;
}

interface UserData {
  id: string;
  email: string;
  preferences: Record<string, any>;
  settings: Record<string, any>;
  lastLogin: number;
}

interface AISignal {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  price: number;
  timestamp: number;
}

interface RedisInfo {
  status: string;
  keyPrefix: string;
  connectionDetails: {
    host: string;
    port: number;
    db: number;
  };
}

class CacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, CacheItem> = new Map();
  private isRedisEnabled = false;
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'renx:',
      ttl: parseInt(process.env.CACHE_TTL || '3600')
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Try to connect to Redis
      if (this.config.host && this.config.host !== 'localhost' || process.env.REDIS_URL) {
        this.redis = new Redis({
          host: this.config.host,
          port: this.config.port,
          password: this.config.password,
          db: this.config.db,
          keyPrefix: this.config.keyPrefix,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        await this.redis.ping();
        this.isRedisEnabled = true;
        console.log('✅ Redis cache service initialized');
      } else {
        console.log('⚠️ Redis not configured, using memory cache');
      }
    } catch (error) {
      console.log('⚠️ Redis connection failed, falling back to memory cache:', error);
      this.redis = null;
      this.isRedisEnabled = false;
    }

    // Start memory cache cleanup
    this.startMemoryCacheCleanup();
  }

  private startMemoryCacheCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];
      
      for (const [key, item] of Array.from(this.memoryCache.entries())) {
        if (item.expiresAt < now) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => this.memoryCache.delete(key));
    }, 60000); // Clean up every minute
  }

  private buildKey(namespace: string, key?: string): string {
    return key ? `${namespace}:${key}` : namespace;
  }

  async get(key: string): Promise<any> {
    try {
      if (this.isRedisEnabled && this.redis) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        const item = this.memoryCache.get(key);
        if (item && item.expiresAt > Date.now()) {
          return item.value;
        }
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const expiry = ttl || this.config.ttl || 3600;

      if (this.isRedisEnabled && this.redis) {
        await this.redis.setex(key, expiry, serializedValue);
      } else {
        this.memoryCache.set(key, {
          value,
          expiresAt: Date.now() + (expiry * 1000)
        });
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.isRedisEnabled && this.redis) {
        await this.redis.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.isRedisEnabled && this.redis) {
        const result = await this.redis.exists(key);
        return result === 1;
      } else {
        const item = this.memoryCache.get(key);
        return item ? item.expiresAt > Date.now() : false;
      }
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.isRedisEnabled && this.redis) {
        await this.redis.flushdb();
      } else {
        this.memoryCache.clear();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  async getKeys(pattern: string): Promise<string[]> {
    try {
      if (this.isRedisEnabled && this.redis) {
        return await this.redis.keys(pattern);
      } else {
        const keys = Array.from(this.memoryCache.keys());
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return keys.filter(key => regex.test(key));
      }
    } catch (error) {
      console.error('Cache getKeys error:', error);
      return [];
    }
  }

  // Specific cache methods for different data types
  async cacheMarketData(tenantId: string, symbol: string, data: MarketData): Promise<void> {
    const key = this.buildKey(`market:${tenantId}`, symbol);
    await this.set(key, data, 60); // Cache for 1 minute
  }

  async getMarketData(tenantId: string, symbol: string): Promise<MarketData | null> {
    const key = this.buildKey(`market:${tenantId}`, symbol);
    return await this.get(key);
  }

  async cachePortfolio(tenantId: string, userId: string, portfolio: Portfolio): Promise<void> {
    const key = this.buildKey(`portfolio:${tenantId}`, userId);
    await this.set(key, portfolio, 300); // Cache for 5 minutes
  }

  async getPortfolio(tenantId: string, userId: string): Promise<Portfolio | null> {
    const key = this.buildKey(`portfolio:${tenantId}`, userId);
    return await this.get(key);
  }

  async cacheUserData(tenantId: string, userId: string, data: UserData): Promise<void> {
    const key = this.buildKey(`user:${tenantId}`, userId);
    await this.set(key, data, 1800); // Cache for 30 minutes
  }

  async getUserData(tenantId: string, userId: string): Promise<UserData | null> {
    const key = this.buildKey(`user:${tenantId}`, userId);
    return await this.get(key);
  }

  async cacheAISignals(tenantId: string, signals: AISignal[]): Promise<void> {
    const key = this.buildKey(`signals:${tenantId}`, 'recent');
    await this.set(key, signals, 600); // Cache for 10 minutes
  }

  async getAISignals(tenantId: string): Promise<AISignal[]> {
    const key = this.buildKey(`signals:${tenantId}`, 'recent');
    return await this.get(key) || [];
  }

  async invalidateUserCache(tenantId: string, userId: string): Promise<void> {
    const patterns = [
      this.buildKey(`user:${tenantId}`, userId),
      this.buildKey(`portfolio:${tenantId}`, userId),
      this.buildKey(`permissions:${tenantId}`, userId)
    ];

    for (const pattern of patterns) {
      await this.delete(pattern);
    }
  }

  async invalidateTenantCache(tenantId: string): Promise<void> {
    const pattern = `*${tenantId}*`;
    const keys = await this.getKeys(pattern);
    
    for (const key of keys) {
      await this.delete(key);
    }
  }

  getStats(): {
    type: 'redis' | 'memory';
    connected: boolean;
    memorySize?: number;
    redisInfo?: RedisInfo;
  } {
    if (this.isRedisEnabled && this.redis) {
      return {
        type: 'redis',
        connected: this.redis.status === 'ready',
        redisInfo: {
          status: this.redis.status,
          keyPrefix: this.config.keyPrefix || '',
          connectionDetails: {
            host: this.config.host,
            port: this.config.port,
            db: this.config.db || 0
          }
        }
      };
    } else {
      return {
        type: 'memory',
        connected: true,
        memorySize: this.memoryCache.size
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (this.isRedisEnabled && this.redis) {
        await this.redis.ping();
        return true;
      }
      return true; // Memory cache is always healthy
    } catch (error) {
      console.error('Cache health check failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }

      if (this.redis) {
        await this.redis.quit();
        this.redis = null;
      }

      this.memoryCache.clear();
      this.isRedisEnabled = false;
      console.log('✅ Cache service closed');
    } catch (error) {
      console.error('❌ Error closing cache service:', error);
    }
  }

  async shutdown(): Promise<void> {
    await this.close();
  }
}

// Export singleton instance
export const cacheService = new CacheService(); 