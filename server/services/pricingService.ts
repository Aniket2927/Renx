import { v4 as uuidv4 } from 'uuid';
import { dbManager } from '../db';
import { cacheService } from './cacheService';

interface PricingCard {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'day' | 'week';
  features: string[];
  limits: Record<string, number>;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

interface CreatePricingCardData {
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval?: 'month' | 'year' | 'day' | 'week';
  features?: string[];
  limits?: Record<string, number>;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

interface TenantSubscription {
  tenantId: string;
  cardId: string;
  status: 'active' | 'cancelled' | 'suspended' | 'expired';
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  paymentMethod?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

interface SubscriptionOptions {
  startDate?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
  autoRenew?: boolean;
}

interface FeatureUsage {
  tenantId: string;
  featureKey: string;
  currentUsage: number;
  limit: number;
  resetDate: string;
  metadata: Record<string, any>;
}

class PricingService {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.createTables();
      this.isInitialized = true;
      console.log('✅ Pricing service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize pricing service:', error);
    }
  }

  private async createTables(): Promise<void> {
    const createTablesQuery = `
      -- Pricing cards table
      CREATE TABLE IF NOT EXISTS tenant_management.pricing_cards (
        card_id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        interval VARCHAR(20) NOT NULL DEFAULT 'month',
        features JSONB NOT NULL DEFAULT '[]',
        limits JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT true,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Tenant subscriptions table
      CREATE TABLE IF NOT EXISTS tenant_management.tenant_subscriptions (
        tenant_id VARCHAR(36) NOT NULL,
        card_id VARCHAR(36) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE,
        next_billing_date TIMESTAMP WITH TIME ZONE,
        payment_method VARCHAR(100),
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (tenant_id),
        FOREIGN KEY (card_id) REFERENCES tenant_management.pricing_cards(card_id)
      );

      -- Feature usage tracking table
      CREATE TABLE IF NOT EXISTS tenant_management.feature_usage (
        tenant_id VARCHAR(36) NOT NULL,
        feature_key VARCHAR(100) NOT NULL,
        current_usage INTEGER NOT NULL DEFAULT 0,
        usage_limit INTEGER NOT NULL DEFAULT 0,
        reset_date TIMESTAMP WITH TIME ZONE NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (tenant_id, feature_key)
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_pricing_cards_active ON tenant_management.pricing_cards(is_active);
      CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_status ON tenant_management.tenant_subscriptions(status);
      CREATE INDEX IF NOT EXISTS idx_feature_usage_tenant ON tenant_management.feature_usage(tenant_id);
    `;

    try {
      const pool = await dbManager.getPool('tenant_management');
      await pool.query(createTablesQuery);
    } catch (error) {
      console.error('Failed to create pricing tables:', error);
      throw error;
    }
  }

  async createPricingCard(cardData: CreatePricingCardData): Promise<PricingCard> {
    try {
      // Validate required fields
      if (!cardData.name || cardData.price === undefined || !cardData.currency) {
        throw new Error('Name, price, and currency are required');
      }

      const cardId = uuidv4();
      const now = new Date().toISOString();

      const card: PricingCard = {
        id: cardId,
        name: cardData.name,
        description: cardData.description || '',
        price: parseFloat(cardData.price.toString()),
        currency: cardData.currency,
        interval: cardData.interval || 'month',
        features: cardData.features || [],
        limits: cardData.limits || {},
        isActive: cardData.isActive !== undefined ? cardData.isActive : true,
        metadata: cardData.metadata || {},
        createdAt: now
      };

      const pool = await dbManager.getPool('tenant_management');
      await pool.query(
        `INSERT INTO tenant_management.pricing_cards 
         (card_id, name, description, price, currency, interval, features, limits, is_active, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          card.id,
          card.name,
          card.description,
          card.price,
          card.currency,
          card.interval,
          JSON.stringify(card.features),
          JSON.stringify(card.limits),
          card.isActive,
          JSON.stringify(card.metadata),
          card.createdAt
        ]
      );

      // Clear cache
      await cacheService.delete('system:pricing_cards');
      await cacheService.delete('system:pricing_cards_active');

      console.log(`💳 Created pricing card: ${card.name} (${card.id})`);
      return card;
    } catch (error) {
      console.error('❌ Failed to create pricing card:', error);
      throw new Error(`Failed to create pricing card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPricingCard(cardId: string): Promise<PricingCard> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      const result = await pool.query(
        'SELECT * FROM tenant_management.pricing_cards WHERE card_id = $1',
        [cardId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Pricing card not found with ID: ${cardId}`);
      }

      const card = result.rows[0];
      return this.formatPricingCard(card);
    } catch (error) {
      console.error('❌ Failed to get pricing card:', error);
      throw new Error(`Failed to get pricing card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listPricingCards(options: { activeOnly?: boolean } = {}): Promise<PricingCard[]> {
    try {
      const { activeOnly = false } = options;
      const cacheKey = `pricing_cards${activeOnly ? '_active' : ''}`;
      
      // Try cache first
      const cachedCards = await cacheService.get('system:' + cacheKey);
      if (cachedCards) {
        return cachedCards;
      }

      let query = 'SELECT * FROM tenant_management.pricing_cards';
      const params: any[] = [];

      if (activeOnly) {
        query += ' WHERE is_active = true';
      }

      query += ' ORDER BY price ASC';

      const pool = await dbManager.getPool('tenant_management');
      const result = await pool.query(query, params);

      const cards = result.rows.map(card => this.formatPricingCard(card));

      // Cache for 1 hour
      await cacheService.set('system:' + cacheKey, cards, 3600);

      return cards;
    } catch (error) {
      console.error('❌ Failed to list pricing cards:', error);
      throw new Error(`Failed to list pricing cards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updatePricingCard(cardId: string, updateData: Partial<CreatePricingCardData>): Promise<PricingCard> {
    try {
      // Get current card to verify it exists
      await this.getPricingCard(cardId);

      const updates: string[] = [];
      const values: any[] = [cardId];
      let paramIndex = 2;

      if (updateData.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(updateData.name);
      }

      if (updateData.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(updateData.description);
      }

      if (updateData.price !== undefined) {
        updates.push(`price = $${paramIndex++}`);
        values.push(parseFloat(updateData.price.toString()));
      }

      if (updateData.currency !== undefined) {
        updates.push(`currency = $${paramIndex++}`);
        values.push(updateData.currency);
      }

      if (updateData.interval !== undefined) {
        updates.push(`interval = $${paramIndex++}`);
        values.push(updateData.interval);
      }

      if (updateData.features !== undefined) {
        updates.push(`features = $${paramIndex++}`);
        values.push(JSON.stringify(updateData.features));
      }

      if (updateData.limits !== undefined) {
        updates.push(`limits = $${paramIndex++}`);
        values.push(JSON.stringify(updateData.limits));
      }

      if (updateData.isActive !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        values.push(updateData.isActive);
      }

      if (updateData.metadata !== undefined) {
        updates.push(`metadata = $${paramIndex++}`);
        values.push(JSON.stringify(updateData.metadata));
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      updates.push(`updated_at = $${paramIndex++}`);
      values.push(new Date().toISOString());

      const query = `
        UPDATE tenant_management.pricing_cards 
        SET ${updates.join(', ')}
        WHERE card_id = $1
      `;

      const pool = await dbManager.getPool('tenant_management');
      await pool.query(query, values);

      // Clear cache
      await cacheService.delete('system:pricing_cards');
      await cacheService.delete('system:pricing_cards_active');

      // Return updated card
      const updatedCard = await this.getPricingCard(cardId);
      console.log(`💳 Updated pricing card: ${updatedCard.name} (${cardId})`);
      return updatedCard;
    } catch (error) {
      console.error('❌ Failed to update pricing card:', error);
      throw new Error(`Failed to update pricing card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deletePricingCard(cardId: string): Promise<boolean> {
    try {
      // Check if any tenants are using this card
      const pool = await dbManager.getPool('tenant_management');
      const usageCheck = await pool.query(
        'SELECT COUNT(*) as count FROM tenant_management.tenant_subscriptions WHERE card_id = $1 AND status = $2',
        [cardId, 'active']
      );

      if (parseInt(usageCheck.rows[0].count) > 0) {
        throw new Error('Cannot delete pricing card that has active subscriptions');
      }

      await pool.query(
        'DELETE FROM tenant_management.pricing_cards WHERE card_id = $1',
        [cardId]
      );

      // Clear cache
      await cacheService.delete('system:pricing_cards');
      await cacheService.delete('system:pricing_cards_active');

      console.log(`🗑️ Deleted pricing card: ${cardId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete pricing card:', error);
      throw new Error(`Failed to delete pricing card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTenantSubscription(tenantId: string): Promise<TenantSubscription | null> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      const result = await pool.query(
        'SELECT * FROM tenant_management.tenant_subscriptions WHERE tenant_id = $1',
        [tenantId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const subscription = result.rows[0];
      return this.formatTenantSubscription(subscription);
    } catch (error) {
      console.error('❌ Failed to get tenant subscription:', error);
      throw new Error(`Failed to get tenant subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async setTenantSubscription(
    tenantId: string, 
    cardId: string, 
    options: SubscriptionOptions = {}
  ): Promise<TenantSubscription> {
    try {
      // Verify pricing card exists
      await this.getPricingCard(cardId);

      const now = new Date();
      const startDate = options.startDate ? new Date(options.startDate) : now;
      
      // Calculate next billing date based on interval
      const card = await this.getPricingCard(cardId);
      const nextBillingDate = new Date(startDate);
      
      switch (card.interval) {
        case 'day':
          nextBillingDate.setDate(nextBillingDate.getDate() + 1);
          break;
        case 'week':
          nextBillingDate.setDate(nextBillingDate.getDate() + 7);
          break;
        case 'month':
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
        case 'year':
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          break;
      }

      const subscription: TenantSubscription = {
        tenantId,
        cardId,
        status: 'active',
        startDate: startDate.toISOString(),
        nextBillingDate: nextBillingDate.toISOString(),
        paymentMethod: options.paymentMethod,
        metadata: {
          autoRenew: options.autoRenew !== false,
          ...options.metadata
        },
        createdAt: now.toISOString()
      };

      const pool = await dbManager.getPool('tenant_management');
      
      // Upsert subscription
      await pool.query(
        `INSERT INTO tenant_management.tenant_subscriptions 
         (tenant_id, card_id, status, start_date, next_billing_date, payment_method, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (tenant_id) 
         DO UPDATE SET 
           card_id = EXCLUDED.card_id,
           status = EXCLUDED.status,
           start_date = EXCLUDED.start_date,
           next_billing_date = EXCLUDED.next_billing_date,
           payment_method = EXCLUDED.payment_method,
           metadata = EXCLUDED.metadata,
           updated_at = CURRENT_TIMESTAMP`,
        [
          subscription.tenantId,
          subscription.cardId,
          subscription.status,
          subscription.startDate,
          subscription.nextBillingDate,
          subscription.paymentMethod,
          JSON.stringify(subscription.metadata),
          subscription.createdAt
        ]
      );

      // Initialize feature usage limits
      await this.initializeTenantFeatureUsage(tenantId, card);

      // Clear cache
      await cacheService.delete(tenantId + ':subscription');
      await cacheService.delete('system:' + tenantId + ':feature_limits');

      console.log(`📋 Set subscription for tenant ${tenantId} to card ${cardId}`);
      return subscription;
    } catch (error) {
      console.error('❌ Failed to set tenant subscription:', error);
      throw new Error(`Failed to set tenant subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cancelTenantSubscription(tenantId: string, options: { endDate?: string } = {}): Promise<boolean> {
    try {
      const endDate = options.endDate || new Date().toISOString();

      const pool = await dbManager.getPool('tenant_management');
      await pool.query(
        `UPDATE tenant_management.tenant_subscriptions 
         SET status = $1, end_date = $2, updated_at = CURRENT_TIMESTAMP
         WHERE tenant_id = $3`,
        ['cancelled', endDate, tenantId]
      );

      // Clear cache
      await cacheService.delete('system:' + tenantId + ':subscription');

      console.log(`❌ Cancelled subscription for tenant ${tenantId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to cancel tenant subscription:', error);
      throw new Error(`Failed to cancel tenant subscription: ${error instanceof Error ? error.message : 'Unknown error' }`);
    }
  }

  async hasTenantFeatureAccess(tenantId: string, featureKey: string): Promise<boolean> {
    try {
      const subscription = await this.getTenantSubscription(tenantId);
      if (!subscription || subscription.status !== 'active') {
        return false;
      }

      const card = await this.getPricingCard(subscription.cardId);
      return card.features.includes(featureKey);
    } catch (error) {
      console.error('❌ Failed to check tenant feature access:', error);
      return false;
    }
  }

  async getTenantFeatureLimits(tenantId: string): Promise<Record<string, number>> {
    try {
      const cacheKey = 'feature_limits';
      const cached = await cacheService.get('system:' + tenantId + ':' + cacheKey);
      if (cached) {
        return cached;
      }

      const subscription = await this.getTenantSubscription(tenantId);
      if (!subscription || subscription.status !== 'active') {
        return {};
      }

      const card = await this.getPricingCard(subscription.cardId);
      
      // Cache for 30 minutes
        await cacheService.set('system:' + tenantId + ':' + cacheKey, card.limits, 1800);
      
      return card.limits;
    } catch (error) {
      console.error('❌ Failed to get tenant feature limits:', error);
      return {};
    }
  }

  async trackFeatureUsage(tenantId: string, featureKey: string, usage: number = 1): Promise<boolean> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      
      // Get current usage
      const currentResult = await pool.query(
        'SELECT current_usage, usage_limit FROM tenant_management.feature_usage WHERE tenant_id = $1 AND feature_key = $2',
        [tenantId, featureKey]
      );

      if (currentResult.rows.length === 0) {
        // Initialize if not exists
        const limits = await this.getTenantFeatureLimits(tenantId);
        const limit = limits[featureKey] || 0;
        
        await pool.query(
          `INSERT INTO tenant_management.feature_usage 
           (tenant_id, feature_key, current_usage, usage_limit, reset_date)
           VALUES ($1, $2, $3, $4, $5)`,
          [tenantId, featureKey, usage, limit, this.getNextResetDate()]
        );
      } else {
        // Update existing
        const current = currentResult.rows[0];
        const newUsage = current.current_usage + usage;
        
        await pool.query(
          'UPDATE tenant_management.feature_usage SET current_usage = $1, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = $2 AND feature_key = $3',
          [newUsage, tenantId, featureKey]
        );
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to track feature usage:', error);
      return false;
    }
  }

  private async initializeTenantFeatureUsage(tenantId: string, card: PricingCard): Promise<void> {
    const pool = await dbManager.getPool('tenant_management');
    const resetDate = this.getNextResetDate();

    for (const [featureKey, limit] of Object.entries(card.limits)) {
      await pool.query(
        `INSERT INTO tenant_management.feature_usage 
         (tenant_id, feature_key, current_usage, usage_limit, reset_date)
         VALUES ($1, $2, 0, $3, $4)
         ON CONFLICT (tenant_id, feature_key) 
         DO UPDATE SET usage_limit = EXCLUDED.usage_limit`,
        [tenantId, featureKey, limit, resetDate]
      );
    }
  }

  private getNextResetDate(): string {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth.toISOString();
  }

  private formatPricingCard(card: any): PricingCard {
    return {
      id: card.card_id,
      name: card.name,
      description: card.description,
      price: parseFloat(card.price),
      currency: card.currency,
      interval: card.interval,
      features: card.features,
      limits: card.limits,
      isActive: card.is_active,
      metadata: card.metadata,
      createdAt: card.created_at.toISOString(),
      updatedAt: card.updated_at ? card.updated_at.toISOString() : undefined
    };
  }

  private formatTenantSubscription(subscription: any): TenantSubscription {
    return {
      tenantId: subscription.tenant_id,
      cardId: subscription.card_id,
      status: subscription.status,
      startDate: subscription.start_date.toISOString(),
      endDate: subscription.end_date ? subscription.end_date.toISOString() : undefined,
      nextBillingDate: subscription.next_billing_date ? subscription.next_billing_date.toISOString() : undefined,
      paymentMethod: subscription.payment_method,
      metadata: subscription.metadata,
      createdAt: subscription.created_at.toISOString(),
      updatedAt: subscription.updated_at ? subscription.updated_at.toISOString() : undefined
    };
  }

  getHealth(): { status: string; initialized: boolean } {
    return {
      status: this.isInitialized ? 'healthy' : 'initializing',
      initialized: this.isInitialized
    };
  }
}

export const pricingService = new PricingService();
export default pricingService; 