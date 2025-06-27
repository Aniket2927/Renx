import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';

interface MessageConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
  enabled?: boolean;
}

interface TenantMessage {
  tenantId: string;
  userId?: string;
  type: string;
  data: any;
  timestamp: number;
}

interface MessageHandler {
  (message: TenantMessage): Promise<void>;
}

interface TradingSignal {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  price: number;
  timestamp: number;
}

interface Notification {
  title: string;
  message: string;
  type: string;
  priority?: 'low' | 'medium' | 'high';
  data?: Record<string, any>;
}

interface AIPrediction {
  symbol: string;
  prediction: number;
  confidence: number;
  timeframe: string;
  features: Record<string, number>;
}

interface SystemAlert {
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
  data?: Record<string, any>;
}

interface MarketUpdate {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  timestamp: number;
  indicators?: Record<string, number>;
}

interface PortfolioUpdate {
  userId: string;
  positions: Array<{
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    pnl: number;
  }>;
  totalValue: number;
  totalPnL: number;
}

interface OrderUpdate {
  orderId: string;
  userId: string;
  symbol: string;
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled';
  filledQuantity?: number;
  filledPrice?: number;
}

interface AuditEvent {
  type: string;
  action: string;
  resource: string;
  userId: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

export class MessageService {
  private kafka?: Kafka;
  private producer?: Producer;
  private consumer?: Consumer;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private isConnected = false;
  private isEnabled = false;

  constructor(config: MessageConfig = {
    brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
    clientId: 'renx-service',
    groupId: 'renx-consumer-group',
    enabled: process.env.KAFKA_ENABLED !== 'false'
  }) {
    this.isEnabled = config.enabled !== false && process.env.KAFKA_ENABLED !== 'false';
    
    if (!this.isEnabled) {
      console.log('📨 Message service (Kafka) disabled - running in standalone mode');
      return;
    }

    try {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      retry: {
        initialRetryTime: 100,
          retries: 3  // Reduced retry count to fail faster
      }
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000
    });

    this.consumer = this.kafka.consumer({
      groupId: config.groupId,
      sessionTimeout: 30000,
      rebalanceTimeout: 60000,
      heartbeatInterval: 3000
    });
    } catch (error) {
      console.warn('Failed to initialize Kafka, running in standalone mode:', error);
      this.isEnabled = false;
    }
  }

  // Initialize connections
  async connect(): Promise<void> {
    if (!this.isEnabled || !this.kafka || !this.producer || !this.consumer) {
      console.log('📨 Kafka not enabled, skipping connection');
      return;
    }

    try {
      await Promise.all([
        this.producer.connect(),
        this.consumer.connect()
      ]);
      
      this.isConnected = true;
      console.log('📨 Kafka producer and consumer connected successfully');
      
      // Start consuming messages
      await this.startConsuming();
    } catch (error) {
      console.warn('📨 Kafka connection failed, continuing without messaging:', error);
      this.isEnabled = false;
      this.isConnected = false;
      // Don't throw - continue without Kafka
    }
  }

  // Publish message with tenant isolation
  async publish(topic: string, message: TenantMessage): Promise<boolean> {
    if (!this.isEnabled || !this.isConnected || !this.producer) {
      console.debug('Message not sent (Kafka not available):', { topic, tenantId: message.tenantId });
      return false;
    }

    try {
      const tenantTopic = this.getTenantTopic(message.tenantId, topic);
      
      await this.producer.send({
        topic: tenantTopic,
        messages: [{
          key: message.userId || message.tenantId,
          value: JSON.stringify({
            ...message,
            timestamp: Date.now()
          }),
          partition: this.getPartition(message.tenantId)
        }]
      });

      return true;
    } catch (error) {
      console.warn('Message publish error:', error);
      return false;
    }
  }

  // Subscribe to messages with handler
  subscribe(topic: string, handler: MessageHandler): void {
    if (!this.isEnabled) {
      console.debug('Message subscription ignored (Kafka not available):', topic);
      return;
    }
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, []);
    }
    this.handlers.get(topic)!.push(handler);
  }

  // Unsubscribe from messages
  unsubscribe(topic: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(topic);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Trading signals
  async publishTradingSignal(tenantId: string, signal: TradingSignal): Promise<boolean> {
    return await this.publish('trading-signals', {
      tenantId,
      type: 'trading-signal',
      data: signal,
      timestamp: Date.now()
    });
  }

  // Market data updates
  async publishMarketUpdate(tenantId: string, marketData: MarketUpdate): Promise<boolean> {
    return await this.publish('market-updates', {
      tenantId,
      type: 'market-update',
      data: marketData,
      timestamp: Date.now()
    });
  }

  // User notifications
  async publishNotification(tenantId: string, userId: string, notification: Notification): Promise<boolean> {
    return await this.publish('notifications', {
      tenantId,
      userId,
      type: 'notification',
      data: notification,
      timestamp: Date.now()
    });
  }

  // Portfolio updates
  async publishPortfolioUpdate(tenantId: string, userId: string, portfolio: PortfolioUpdate): Promise<boolean> {
    return await this.publish('portfolio-updates', {
      tenantId,
      userId,
      type: 'portfolio-update',
      data: portfolio,
      timestamp: Date.now()
    });
  }

  // AI predictions
  async publishAIPrediction(tenantId: string, prediction: AIPrediction): Promise<boolean> {
    return await this.publish('ai-predictions', {
      tenantId,
      type: 'ai-prediction',
      data: prediction,
      timestamp: Date.now()
    });
  }

  // Order updates
  async publishOrderUpdate(tenantId: string, userId: string, order: OrderUpdate): Promise<boolean> {
    return await this.publish('order-updates', {
      tenantId,
      userId,
      type: 'order-update',
      data: order,
      timestamp: Date.now()
    });
  }

  // System alerts
  async publishSystemAlert(tenantId: string, alert: SystemAlert): Promise<boolean> {
    return await this.publish('system-alerts', {
      tenantId,
      type: 'system-alert',
      data: alert,
      timestamp: Date.now()
    });
  }

  // Audit events
  async publishAuditEvent(tenantId: string, userId: string, event: AuditEvent): Promise<boolean> {
    return await this.publish('audit-events', {
      tenantId,
      userId,
      type: 'audit-event',
      data: event,
      timestamp: Date.now()
    });
  }

  // Bulk publish
  async publishBatch(topic: string, messages: TenantMessage[]): Promise<boolean> {
    if (!this.isEnabled || !this.isConnected || !this.producer || messages.length === 0) {
      return false;
    }

    try {
      // Group messages by tenant for topic isolation
      const messagesByTenant = messages.reduce((acc, message) => {
        const tenantTopic = this.getTenantTopic(message.tenantId, topic);
        if (!acc[tenantTopic]) {
          acc[tenantTopic] = [];
        }
        acc[tenantTopic].push({
          key: message.userId || message.tenantId,
          value: JSON.stringify({
            ...message,
            timestamp: Date.now()
          }),
          partition: this.getPartition(message.tenantId)
        });
        return acc;
      }, {} as Record<string, any[]>);

      // Send messages for each tenant topic
      const promises = Object.entries(messagesByTenant).map(([tenantTopic, msgs]) =>
        this.producer!.send({
          topic: tenantTopic,
          messages: msgs
        })
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Batch publish error:', error);
      return false;
    }
  }

  // Private methods
  private getTenantTopic(tenantId: string, baseTopic: string): string {
    return `tenant-${tenantId}-${baseTopic}`;
  }

  private getPartition(tenantId: string): number {
    // Simple hash-based partitioning for tenant isolation
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
      const char = tenantId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 3; // Assuming 3 partitions per topic
  }

  private async startConsuming(): Promise<void> {
    try {
      // Subscribe to all tenant topics (using wildcard pattern)
      const topics = [
        'tenant-*-trading-signals',
        'tenant-*-market-updates',
        'tenant-*-notifications',
        'tenant-*-portfolio-updates',
        'tenant-*-ai-predictions',
        'tenant-*-order-updates',
        'tenant-*-system-alerts',
        'tenant-*-audit-events'
      ];

      // Note: Kafka doesn't support wildcard subscriptions directly
      // In production, you'd need to manage topic subscriptions dynamically
      // For now, we'll subscribe to known patterns
      
      await this.consumer!.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
          try {
            if (!message.value) return;

            const tenantMessage: TenantMessage = JSON.parse(message.value.toString());
            
            // Extract base topic from tenant-specific topic
            const baseTopic = this.extractBaseTopic(topic);
            
            // Execute handlers for this topic
            const handlers = this.handlers.get(baseTopic);
            if (handlers) {
              await Promise.all(
                handlers.map(handler => handler(tenantMessage))
              );
            }
          } catch (error) {
            console.error('Message processing error:', error);
          }
        }
      });
    } catch (error) {
      console.error('Consumer start error:', error);
    }
  }

  private extractBaseTopic(tenantTopic: string): string {
    // Extract base topic from tenant-specific topic
    // e.g., "tenant-123-trading-signals" -> "trading-signals"
    const parts = tenantTopic.split('-');
    return parts.slice(2).join('-');
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    if (!this.isEnabled || !this.kafka) {
      return false;
    }
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      const metadata = await admin.fetchTopicMetadata();
      await admin.disconnect();
      return true;
    } catch (error) {
      console.error('Kafka health check error:', error);
      return false;
    }
  }

  // Create topics for tenant
  async createTenantTopics(tenantId: string): Promise<boolean> {
    if (!this.isEnabled || !this.kafka) {
      return false;
    }
    try {
      const admin = this.kafka.admin();
      await admin.connect();

      const baseTopics = [
        'trading-signals',
        'market-updates',
        'notifications',
        'portfolio-updates',
        'ai-predictions',
        'order-updates',
        'system-alerts',
        'audit-events'
      ];

      const tenantTopics = baseTopics.map(topic => ({
        topic: this.getTenantTopic(tenantId, topic),
        numPartitions: 3,
        replicationFactor: 1,
        configEntries: [
          { name: 'retention.ms', value: '604800000' }, // 7 days
          { name: 'cleanup.policy', value: 'delete' }
        ]
      }));

      await admin.createTopics({
        topics: tenantTopics,
        waitForLeaders: true
      });

      await admin.disconnect();
      return true;
    } catch (error) {
      console.error('Topic creation error:', error);
      return false;
    }
  }

  // Delete topics for tenant
  async deleteTenantTopics(tenantId: string): Promise<boolean> {
    if (!this.isEnabled || !this.kafka) {
      return false;
    }
    try {
      const admin = this.kafka.admin();
      await admin.connect();

      const baseTopics = [
        'trading-signals',
        'market-updates',
        'notifications',
        'portfolio-updates',
        'ai-predictions',
        'order-updates',
        'system-alerts',
        'audit-events'
      ];

      const tenantTopics = baseTopics.map(topic => 
        this.getTenantTopic(tenantId, topic)
      );

      await admin.deleteTopics({
        topics: tenantTopics,
        timeout: 30000
      });

      await admin.disconnect();
      return true;
    } catch (error) {
      console.error('Topic deletion error:', error);
      return false;
    }
  }

  // Cleanup and close connections
  async disconnect(): Promise<void> {
    if (!this.isEnabled || !this.producer || !this.consumer) {
      return;
    }
    try {
      await Promise.all([
        this.producer.disconnect(),
        this.consumer.disconnect()
      ]);
      this.isConnected = false;
      console.log('Kafka connections closed');
    } catch (error) {
      console.error('Kafka disconnect error:', error);
    }
  }
}

// Singleton instance
export const messageService = new MessageService(); 