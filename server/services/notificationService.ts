import * as nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { messageService } from './messageService';
import { dbManager } from '../db';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface SystemNotificationOptions {
  type: string;
  data: Record<string, any>;
  tenantId?: string;
  userId?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  channels?: ('email' | 'push' | 'webhook')[];
}

interface WebhookOptions {
  url: string;
  event: string;
  data: Record<string, any>;
  retryCount?: number;
  timeout?: number;
}

interface NotificationTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
  variables?: string[];
}

interface PushNotificationOptions {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  badge?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  status: 'pending' | 'sent' | 'read' | 'failed';
  createdAt: string;
  readAt?: string;
  fromUserId?: string;
}

interface CreateNotificationData {
  tenantId: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  channels?: string[];
  fromUserId?: string;
}

interface NotificationPreferences {
  tenantId: string;
  userId: string;
  preferences: Record<string, {
    enabled: boolean;
    channels: string[];
  }>;
}

interface GetNotificationsOptions {
  unreadOnly?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

class NotificationService {
  private emailTransporter: nodemailer.Transporter | null = null;
  private templates: Map<string, NotificationTemplate> = new Map();
  private webhookRetryQueue: Map<string, WebhookOptions> = new Map();
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.createTables();
      await this.initializeEmailTransporter();
      await this.loadEmailTemplates();
      this.isInitialized = true;
      console.log('✅ Notification service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  private async createTables(): Promise<void> {
    const createTablesQuery = `
      -- Notifications table
      CREATE TABLE IF NOT EXISTS tenant_management.notifications (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB DEFAULT '{}',
        priority VARCHAR(20) DEFAULT 'medium',
        channels JSONB DEFAULT '[]',
        status VARCHAR(20) DEFAULT 'pending',
        from_user_id VARCHAR(36),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP WITH TIME ZONE,
        sent_at TIMESTAMP WITH TIME ZONE
      );

      -- Notification preferences table
      CREATE TABLE IF NOT EXISTS tenant_management.notification_preferences (
        tenant_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        preferences JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (tenant_id, user_id)
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_notifications_tenant_user ON tenant_management.notifications(tenant_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_status ON tenant_management.notifications(status);
      CREATE INDEX IF NOT EXISTS idx_notifications_type ON tenant_management.notifications(type);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON tenant_management.notifications(created_at);
    `;

    try {
      const pool = await dbManager.getPool('tenant_management');
      await pool.query(createTablesQuery);
    } catch (error) {
      console.error('Failed to create notification tables:', error);
      throw error;
    }
  }

  private async initializeEmailTransporter(): Promise<void> {
    if (!process.env.EMAIL_HOST) {
      console.warn('⚠️ Email configuration not found, email notifications will be disabled');
      return;
    }

    try {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        pool: true,
        maxConnections: 10,
        maxMessages: 100,
        rateLimit: 10 // messages per second
      });

      // Verify connection
      if (this.emailTransporter) {
        await this.emailTransporter.verify();
        console.log('✅ Email transporter initialized and verified');
      }
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error);
      this.emailTransporter = null;
    }
  }

  private async loadEmailTemplates(): Promise<void> {
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const templateDir = path.join(__dirname, '../templates/email');
    
    try {
      // Ensure template directory exists
      await fs.mkdir(templateDir, { recursive: true });
      
      // Create default templates if they don't exist
      await this.createDefaultTemplates(templateDir);
      
      // Load all template files
      const files = await fs.readdir(templateDir);
      const templateFiles = files.filter(file => file.endsWith('.json'));
      
      for (const file of templateFiles) {
        try {
          const templatePath = path.join(templateDir, file);
          const templateContent = await fs.readFile(templatePath, 'utf8');
          const template: NotificationTemplate = JSON.parse(templateContent);
          this.templates.set(template.name, template);
        } catch (error) {
          console.error(`Failed to load template ${file}:`, error);
        }
      }
      
      console.log(`📧 Loaded ${this.templates.size} email templates`);
    } catch (error) {
      console.error('Failed to load email templates:', error);
    }
  }

  private async createDefaultTemplates(templateDir: string): Promise<void> {
    const defaultTemplates: NotificationTemplate[] = [
      {
        name: 'tenant-created',
        subject: 'Welcome to RenX Trading Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Welcome to RenX Trading Platform</h1>
            <p>Your tenant has been successfully created and is ready to use.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Account Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Tenant Name:</strong> {{tenantName}}</li>
                <li><strong>Tenant ID:</strong> {{tenantId}}</li>
                <li><strong>Admin Email:</strong> {{adminEmail}}</li>
                <li><strong>Plan:</strong> {{plan}}</li>
                <li><strong>Created:</strong> {{timestamp}}</li>
              </ul>
            </div>
            <p>You can now access your dashboard and start configuring your trading environment.</p>
            <a href="{{dashboardUrl}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Access Dashboard</a>
          </div>
        `,
        variables: ['tenantName', 'tenantId', 'adminEmail', 'plan', 'timestamp', 'dashboardUrl']
      },
      {
        name: 'price-alert',
        subject: 'Price Alert: {{symbol}} - {{alertType}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Price Alert Triggered</h1>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
              <h3>{{symbol}} Alert</h3>
              <p><strong>Alert Type:</strong> {{alertType}}</p>
              <p><strong>Current Price:</strong> $\{{currentPrice}}</p>
              <p><strong>Target Price:</strong> $\{{targetPrice}}</p>
              <p><strong>Change:</strong> {{priceChange}}%</p>
              <p><strong>Triggered At:</strong> {{timestamp}}</p>
            </div>
            <p>This alert was triggered based on your configured price monitoring settings.</p>
            <a href="{{tradingUrl}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View in Trading Dashboard</a>
          </div>
        `,
        variables: ['symbol', 'alertType', 'currentPrice', 'targetPrice', 'priceChange', 'timestamp', 'tradingUrl']
      },
      {
        name: 'trade-executed',
        subject: 'Trade Executed: {{symbol}} {{orderType}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #059669;">Trade Executed Successfully</h1>
            <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 20px 0;">
              <h3>Order Details</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Symbol:</strong> {{symbol}}</li>
                <li><strong>Order Type:</strong> {{orderType}}</li>
                <li><strong>Quantity:</strong> {{quantity}}</li>
                <li><strong>Price:</strong> $\{{price}}</li>
                <li><strong>Total Value:</strong> $\{{totalValue}}</li>
                <li><strong>Executed At:</strong> {{timestamp}}</li>
                <li><strong>Order ID:</strong> {{orderId}}</li>
              </ul>
            </div>
            <p>Your order has been executed successfully. You can view the details in your trading history.</p>
            <a href="{{portfolioUrl}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Portfolio</a>
          </div>
        `,
        variables: ['symbol', 'orderType', 'quantity', 'price', 'totalValue', 'timestamp', 'orderId', 'portfolioUrl']
      },
      {
        name: 'security-alert',
        subject: 'Security Alert: {{alertType}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Security Alert</h1>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
              <h3>{{alertType}}</h3>
              <p><strong>IP Address:</strong> {{ipAddress}}</p>
              <p><strong>Location:</strong> {{location}}</p>
              <p><strong>User Agent:</strong> {{userAgent}}</p>
              <p><strong>Time:</strong> {{timestamp}}</p>
            </div>
            <p>If this was not you, please secure your account immediately and contact support.</p>
            <a href="{{securityUrl}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Review Security Settings</a>
          </div>
        `,
        variables: ['alertType', 'ipAddress', 'location', 'userAgent', 'timestamp', 'securityUrl']
      }
    ];

    for (const template of defaultTemplates) {
      const templatePath = path.join(templateDir, `${template.name}.json`);
      try {
        await fs.access(templatePath);
        // Template already exists, skip
      } catch {
        // Template doesn't exist, create it
        await fs.writeFile(templatePath, JSON.stringify(template, null, 2));
      }
    }
  }

  private renderTemplate(templateName: string, data: Record<string, any>): { html: string; subject: string } {
    const template = this.templates.get(templateName);
    
    if (!template) {
      console.warn(`Template "${templateName}" not found, using fallback`);
      return {
        html: `<h1>Notification</h1><pre>${JSON.stringify(data, null, 2)}</pre>`,
        subject: 'Notification'
      };
    }

    // Simple template rendering with variable substitution
    const renderText = (text: string) => {
      return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const value = key.trim().split('.').reduce((obj: any, prop: string) => {
          return obj && obj[prop] !== undefined ? obj[prop] : undefined;
        }, data);
        
        return value !== undefined ? String(value) : match;
      });
    };

    return {
      html: renderText(template.html),
      subject: renderText(template.subject)
    };
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.emailTransporter) {
      console.warn('Email transporter not available, skipping email notification');
      return false;
    }

    try {
      const { html, subject } = this.renderTemplate(options.template, options.data);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@renx.ai',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject || subject,
        html,
        attachments: options.attachments
      };
      
      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${mailOptions.to}: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendSystemNotification(options: SystemNotificationOptions): Promise<boolean> {
    try {
      // Create notification object for messageService (different interface)
      const messageNotification = {
        title: options.data.title || 'System Notification',
        message: options.data.message || 'You have a new notification',
        type: options.type,
        priority: (options.priority === 'critical' ? 'high' : options.priority || 'medium') as 'low' | 'medium' | 'high',
        data: {
          ...options.data,
          timestamp: options.data.timestamp || new Date().toISOString()
        }
      };

      // Send to message service for real-time delivery
      if (options.tenantId) {
        await messageService.publishNotification(options.tenantId, options.userId || '', messageNotification);
      } else {
        // For system-wide notifications, broadcast to all tenants
        await messageService.publishNotification('system', '', messageNotification);
      }

      // Handle different notification channels
      if (options.channels?.includes('email') && options.data.email) {
        await this.sendEmail({
          to: options.data.email,
          subject: options.data.subject || 'System Notification',
          template: options.type,
          data: options.data
        });
      }

      if (options.channels?.includes('push') && options.userId) {
        await this.sendPushNotification({
          userId: options.userId,
          title: options.data.title || 'System Notification',
          body: options.data.message || 'You have a new notification',
          data: options.data
        });
      }

      if (options.channels?.includes('webhook') && options.data.webhookUrl) {
        await this.sendWebhook({
          url: options.data.webhookUrl,
          event: options.type,
          data: options.data
        });
      }

      console.log(`🔔 System notification sent: ${options.type}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send system notification:', error);
      return false;
    }
  }

  async sendPushNotification(options: PushNotificationOptions): Promise<boolean> {
    try {
      // Create push notification object for messageService
      const messageNotification = {
        title: options.title,
        message: options.body,
        type: 'push_notification',
        priority: 'medium' as const,
        data: {
          ...options.data,
          userId: options.userId,
          icon: options.icon || '/icons/notification.png',
          badge: options.badge,
          actions: options.actions,
          timestamp: new Date().toISOString()
        }
      };

      // Send through WebSocket for real-time delivery
      await messageService.publishNotification('system', options.userId, messageNotification);

      console.log(`📱 Push notification sent to user ${options.userId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send push notification:', error);
      return false;
    }
  }

  async sendWebhook(options: WebhookOptions): Promise<boolean> {
    const maxRetries = options.retryCount || 3;
    const timeout = options.timeout || 10000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const payload = {
          event: options.event,
          data: {
            ...options.data,
            timestamp: options.data.timestamp || new Date().toISOString()
          },
          attempt,
          maxRetries
        };

        const signature = this.generateWebhookSignature(payload);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(options.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RenX-Signature': signature,
            'X-RenX-Event': options.event,
            'User-Agent': 'RenX-Webhook/1.0'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Webhook failed with status: ${response.status}`);
        }

        console.log(`🔗 Webhook sent to ${options.url}: ${options.event} (attempt ${attempt})`);
        return true;
      } catch (error) {
        console.error(`❌ Webhook attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          console.error(`🚨 Webhook failed after ${maxRetries} attempts`);
          return false;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return false;
  }

  private generateWebhookSignature(payload: any): string {
    const secret = process.env.WEBHOOK_SECRET || 'default-webhook-secret';
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  // Utility methods for common notification scenarios
  async sendTenantCreatedNotification(tenantData: any): Promise<boolean> {
    return this.sendSystemNotification({
      type: 'tenant-created',
      data: {
        ...tenantData,
        email: tenantData.adminEmail,
        subject: 'Welcome to RenX Trading Platform'
      },
      tenantId: tenantData.tenantId,
      channels: ['email']
    });
  }

  async sendPriceAlert(alertData: any): Promise<boolean> {
    return this.sendSystemNotification({
      type: 'price-alert',
      data: alertData,
      tenantId: alertData.tenantId,
      userId: alertData.userId,
      priority: 'high',
      channels: ['email', 'push']
    });
  }

  async sendTradeExecutedNotification(tradeData: any): Promise<boolean> {
    return this.sendSystemNotification({
      type: 'trade-executed',
      data: tradeData,
      tenantId: tradeData.tenantId,
      userId: tradeData.userId,
      priority: 'medium',
      channels: ['email', 'push']
    });
  }

  async sendSecurityAlert(securityData: any): Promise<boolean> {
    return this.sendSystemNotification({
      type: 'security-alert',
      data: securityData,
      tenantId: securityData.tenantId,
      userId: securityData.userId,
      priority: 'critical',
      channels: ['email', 'push']
    });
  }

  getHealth(): { status: string; email: boolean; templates: number } {
    return {
      status: this.isInitialized ? 'healthy' : 'initializing',
      email: this.emailTransporter !== null,
      templates: this.templates.size
    };
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    try {
      const notification: Notification = {
        id: uuidv4(),
        tenantId: data.tenantId,
        userId: data.userId || '',
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        priority: data.priority || 'medium',
        channels: data.channels || ['in_app'],
        status: 'pending',
        createdAt: new Date().toISOString(),
        fromUserId: data.fromUserId
      };

      const pool = await dbManager.getPool('tenant_management');
      await pool.query(
        `INSERT INTO tenant_management.notifications 
         (id, tenant_id, user_id, type, title, message, data, priority, channels, status, from_user_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          notification.id,
          notification.tenantId,
          notification.userId,
          notification.type,
          notification.title,
          notification.message,
          JSON.stringify(notification.data),
          notification.priority,
          JSON.stringify(notification.channels),
          notification.status,
          notification.fromUserId,
          notification.createdAt
        ]
      );

      // Send notification through configured channels
      await this.sendNotificationThroughChannels(notification);

      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  async getUserNotifications(tenantId: string, userId: string, options: GetNotificationsOptions = {}): Promise<Notification[]> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      
      let query = `
        SELECT * FROM tenant_management.notifications 
        WHERE tenant_id = $1 AND user_id = $2
      `;
      const params: any[] = [tenantId, userId];
      let paramIndex = 3;

      if (options.unreadOnly) {
        query += ` AND read_at IS NULL`;
      }

      if (options.type) {
        query += ` AND type = $${paramIndex}`;
        params.push(options.type);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC`;

      if (options.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
        paramIndex++;
      }

      if (options.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(options.offset);
      }

      const result = await pool.query(query, params);
      return result.rows.map(this.formatNotification);
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      return [];
    }
  }

  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      const result = await pool.query(
        'SELECT COUNT(*) FROM tenant_management.notifications WHERE tenant_id = $1 AND user_id = $2 AND read_at IS NULL',
        [tenantId, userId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  async markAsRead(tenantId: string, userId: string, notificationId: string): Promise<boolean> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      const result = await pool.query(
        `UPDATE tenant_management.notifications 
         SET read_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND tenant_id = $2 AND user_id = $3 AND read_at IS NULL`,
        [notificationId, tenantId, userId]
      );
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  async markAllAsRead(tenantId: string, userId: string): Promise<number> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      const result = await pool.query(
        `UPDATE tenant_management.notifications 
         SET read_at = CURRENT_TIMESTAMP 
         WHERE tenant_id = $1 AND user_id = $2 AND read_at IS NULL`,
        [tenantId, userId]
      );
      return result.rowCount || 0;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return 0;
    }
  }

  async deleteNotification(tenantId: string, userId: string, notificationId: string): Promise<boolean> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      const result = await pool.query(
        'DELETE FROM tenant_management.notifications WHERE id = $1 AND tenant_id = $2 AND user_id = $3',
        [notificationId, tenantId, userId]
      );
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  }

  async getUserPreferences(tenantId: string, userId: string): Promise<NotificationPreferences | null> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      const result = await pool.query(
        'SELECT * FROM tenant_management.notification_preferences WHERE tenant_id = $1 AND user_id = $2',
        [tenantId, userId]
      );
      
      if (result.rows.length === 0) {
        // Return default preferences
        return {
          tenantId,
          userId,
          preferences: {
            trade_executed: { enabled: true, channels: ['email', 'in_app'] },
            price_alert: { enabled: true, channels: ['email', 'push', 'in_app'] },
            system: { enabled: true, channels: ['in_app'] },
            security: { enabled: true, channels: ['email', 'in_app'] }
          }
        };
      }

      return {
        tenantId: result.rows[0].tenant_id,
        userId: result.rows[0].user_id,
        preferences: result.rows[0].preferences
      };
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }

  async updateUserPreferences(tenantId: string, userId: string, preferences: Record<string, any>): Promise<NotificationPreferences> {
    try {
      const pool = await dbManager.getPool('tenant_management');
      const now = new Date().toISOString();
      
      await pool.query(
        `INSERT INTO tenant_management.notification_preferences (tenant_id, user_id, preferences, updated_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (tenant_id, user_id) 
         DO UPDATE SET preferences = $3, updated_at = $4`,
        [tenantId, userId, JSON.stringify(preferences), now]
      );

      return {
        tenantId,
        userId,
        preferences
      };
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  async broadcastToTenant(tenantId: string, data: { message: string; type: string; priority: string; fromUserId: string }): Promise<number> {
    try {
      // Get all users in the tenant
      const pool = await dbManager.getPool('tenant_management');
      const result = await pool.query(
        'SELECT DISTINCT user_id FROM tenant_management.tenant_users WHERE tenant_id = $1',
        [tenantId]
      );

      let count = 0;
      for (const row of result.rows) {
        try {
          await this.createNotification({
            tenantId,
            userId: row.user_id,
            type: data.type,
            title: 'Broadcast Message',
            message: data.message,
            priority: data.priority as any,
            fromUserId: data.fromUserId
          });
          count++;
        } catch (error) {
          console.error(`Failed to send broadcast to user ${row.user_id}:`, error);
        }
      }

      return count;
    } catch (error) {
      console.error('Failed to broadcast to tenant:', error);
      return 0;
    }
  }

  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    return Array.from(this.templates.values());
  }

  async sendTestNotification(tenantId: string, userId: string, data: { message: string; channels: string[]; type: string }): Promise<boolean> {
    try {
      await this.createNotification({
        tenantId,
        userId,
        type: data.type,
        title: 'Test Notification',
        message: data.message,
        channels: data.channels,
        priority: 'low'
      });
      return true;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return false;
    }
  }

  private async sendNotificationThroughChannels(notification: Notification): Promise<void> {
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case 'email':
            if (this.emailTransporter) {
              // Get user email and send
              // This would need user lookup logic
            }
            break;
          case 'push':
            // Send push notification
            break;
          case 'webhook':
            // Send webhook
            break;
          case 'in_app':
          default:
            // In-app notifications are stored in database
            break;
        }
      } catch (error) {
        console.error(`Failed to send notification through ${channel}:`, error);
      }
    }

    // Update status to sent
    try {
      const pool = await dbManager.getPool('tenant_management');
      await pool.query(
        'UPDATE tenant_management.notifications SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['sent', notification.id]
      );
    } catch (error) {
      console.error('Failed to update notification status:', error);
    }
  }

  private formatNotification(row: any): Notification {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      data: row.data || {},
      priority: row.priority,
      channels: row.channels || [],
      status: row.status,
      createdAt: row.created_at,
      readAt: row.read_at,
      fromUserId: row.from_user_id
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService; 