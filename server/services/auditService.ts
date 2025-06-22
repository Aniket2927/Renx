import { v4 as uuidv4 } from 'uuid';
import { dbManager } from '../db';
import { cacheService } from './cacheService';

interface AuditLogEntry {
  id: string;
  tenantId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  metadata: Record<string, any>;
}

interface CreateAuditLogData {
  tenantId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface AuditQuery {
  tenantId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

interface SecurityEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'password_change' | 'permission_change' | 'data_access' | 'suspicious_activity';
  tenantId?: string;
  userId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class AuditService {
  private isInitialized = false;
  private logBuffer: AuditLogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly bufferSize = 100;
  private readonly flushIntervalMs = 5000; // 5 seconds

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.createTables();
      this.startBufferFlush();
      this.isInitialized = true;
      console.log('✅ Audit service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize audit service:', error);
    }
  }

  private async createTables(): Promise<void> {
    const createTablesQuery = `
      -- Audit logs table
      CREATE TABLE IF NOT EXISTS tenant_management.audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36),
        user_id VARCHAR(36),
        action VARCHAR(255) NOT NULL,
        resource VARCHAR(255) NOT NULL,
        resource_id VARCHAR(255),
        details JSONB NOT NULL DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        session_id VARCHAR(255),
        severity VARCHAR(20) NOT NULL DEFAULT 'medium',
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Security events table for specialized security tracking
      CREATE TABLE IF NOT EXISTS tenant_management.security_events (
        id VARCHAR(36) PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        tenant_id VARCHAR(36),
        user_id VARCHAR(36),
        details JSONB NOT NULL DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        severity VARCHAR(20) NOT NULL DEFAULT 'medium',
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        resolved BOOLEAN NOT NULL DEFAULT false,
        resolution_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON tenant_management.audit_logs(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON tenant_management.audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON tenant_management.audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON tenant_management.audit_logs(resource);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON tenant_management.audit_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON tenant_management.audit_logs(severity);
      
      CREATE INDEX IF NOT EXISTS idx_security_events_type ON tenant_management.security_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_security_events_tenant_id ON tenant_management.security_events(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_security_events_severity ON tenant_management.security_events(severity);
      CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON tenant_management.security_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON tenant_management.security_events(resolved);
    `;

    try {
      const pool = await dbManager.getPool('tenant_management');
      await pool.query(createTablesQuery);
    } catch (error) {
      console.error('Failed to create audit tables:', error);
      throw error;
    }
  }

  private startBufferFlush(): void {
    this.flushInterval = setInterval(async () => {
      await this.flushBuffer();
    }, this.flushIntervalMs);
  }

  private async flushBuffer(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await this.batchInsertLogs(logsToFlush);
    } catch (error) {
      console.error('❌ Failed to flush audit log buffer:', error);
      // Put logs back in buffer for retry
      this.logBuffer.unshift(...logsToFlush);
    }
  }

  private async batchInsertLogs(logs: AuditLogEntry[]): Promise<void> {
    if (logs.length === 0) return;

    const pool = await dbManager.getPool('tenant_management');
    const values: any[] = [];
    const placeholders: string[] = [];

    logs.forEach((log, index) => {
      const baseIndex = index * 12;
      placeholders.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11}, $${baseIndex + 12})`
      );
      
      values.push(
        log.id,
        log.tenantId || null,
        log.userId || null,
        log.action,
        log.resource,
        log.resourceId || null,
        JSON.stringify(log.details),
        log.ipAddress || null,
        log.userAgent || null,
        log.sessionId || null,
        log.severity,
        log.timestamp
      );
    });

    const query = `
      INSERT INTO tenant_management.audit_logs 
      (id, tenant_id, user_id, action, resource, resource_id, details, ip_address, user_agent, session_id, severity, timestamp)
      VALUES ${placeholders.join(', ')}
    `;

    await pool.query(query, values);
    console.log(`📝 Flushed ${logs.length} audit log entries`);
  }

  async log(data: CreateAuditLogData): Promise<void> {
    const logEntry: AuditLogEntry = {
      id: uuidv4(),
      tenantId: data.tenantId,
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details || {},
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      sessionId: data.sessionId,
      severity: data.severity || 'medium',
      timestamp: new Date().toISOString(),
      metadata: data.metadata || {}
    };

    // Add to buffer
    this.logBuffer.push(logEntry);

    // Flush immediately if buffer is full or severity is critical
    if (this.logBuffer.length >= this.bufferSize || logEntry.severity === 'critical') {
      await this.flushBuffer();
    }

    // Log to console for immediate visibility of critical events
    if (logEntry.severity === 'critical') {
      console.warn(`🚨 CRITICAL AUDIT EVENT: ${logEntry.action} on ${logEntry.resource}`, {
        tenantId: logEntry.tenantId,
        userId: logEntry.userId,
        details: logEntry.details
      });
    }
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const eventId = uuidv4();
      const timestamp = new Date().toISOString();

      const pool = await dbManager.getPool('tenant_management');
      await pool.query(
        `INSERT INTO tenant_management.security_events 
         (id, event_type, tenant_id, user_id, details, ip_address, user_agent, severity, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          eventId,
          event.type,
          event.tenantId || null,
          event.userId || null,
          JSON.stringify(event.details),
          event.ipAddress || null,
          event.userAgent || null,
          event.severity,
          timestamp
        ]
      );

      // Also log as regular audit entry
      await this.log({
        tenantId: event.tenantId,
        userId: event.userId,
        action: `security_event_${event.type}`,
        resource: 'security',
        details: event.details,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        severity: event.severity
      });

      console.log(`🔒 Security event logged: ${event.type} (${event.severity})`);
    } catch (error) {
      console.error('❌ Failed to log security event:', error);
    }
  }

  async queryLogs(query: AuditQuery): Promise<{ logs: AuditLogEntry[]; total: number }> {
    try {
      const conditions: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (query.tenantId) {
        conditions.push(`tenant_id = $${paramIndex++}`);
        values.push(query.tenantId);
      }

      if (query.userId) {
        conditions.push(`user_id = $${paramIndex++}`);
        values.push(query.userId);
      }

      if (query.action) {
        conditions.push(`action ILIKE $${paramIndex++}`);
        values.push(`%${query.action}%`);
      }

      if (query.resource) {
        conditions.push(`resource = $${paramIndex++}`);
        values.push(query.resource);
      }

      if (query.severity) {
        conditions.push(`severity = $${paramIndex++}`);
        values.push(query.severity);
      }

      if (query.startDate) {
        conditions.push(`timestamp >= $${paramIndex++}`);
        values.push(query.startDate);
      }

      if (query.endDate) {
        conditions.push(`timestamp <= $${paramIndex++}`);
        values.push(query.endDate);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const limit = query.limit || 100;
      const offset = query.offset || 0;

      const pool = await dbManager.getPool('tenant_management');

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM tenant_management.audit_logs ${whereClause}`;
      const countResult = await pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].total);

      // Get logs
      const logsQuery = `
        SELECT * FROM tenant_management.audit_logs 
        ${whereClause}
        ORDER BY timestamp DESC 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      values.push(limit, offset);

      const logsResult = await pool.query(logsQuery, values);
      const logs = logsResult.rows.map(row => this.formatAuditLog(row));

      return { logs, total };
    } catch (error) {
      console.error('❌ Failed to query audit logs:', error);
      throw new Error(`Failed to query audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTenantAuditSummary(tenantId: string, days: number = 30): Promise<{
    totalEvents: number;
    criticalEvents: number;
    topActions: Array<{ action: string; count: number }>;
    topUsers: Array<{ userId: string; count: number }>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const pool = await dbManager.getPool('tenant_management');

      // Get summary statistics
      const summaryQuery = `
        SELECT 
          COUNT(*) as total_events,
          COUNT(*) FILTER (WHERE severity = 'critical') as critical_events
        FROM tenant_management.audit_logs 
        WHERE tenant_id = $1 AND timestamp >= $2
      `;
      const summaryResult = await pool.query(summaryQuery, [tenantId, startDate.toISOString()]);

      // Get top actions
      const actionsQuery = `
        SELECT action, COUNT(*) as count
        FROM tenant_management.audit_logs 
        WHERE tenant_id = $1 AND timestamp >= $2
        GROUP BY action
        ORDER BY count DESC
        LIMIT 10
      `;
      const actionsResult = await pool.query(actionsQuery, [tenantId, startDate.toISOString()]);

      // Get top users
      const usersQuery = `
        SELECT user_id, COUNT(*) as count
        FROM tenant_management.audit_logs 
        WHERE tenant_id = $1 AND timestamp >= $2 AND user_id IS NOT NULL
        GROUP BY user_id
        ORDER BY count DESC
        LIMIT 10
      `;
      const usersResult = await pool.query(usersQuery, [tenantId, startDate.toISOString()]);

      return {
        totalEvents: parseInt(summaryResult.rows[0].total_events),
        criticalEvents: parseInt(summaryResult.rows[0].critical_events),
        topActions: actionsResult.rows.map(row => ({
          action: row.action,
          count: parseInt(row.count)
        })),
        topUsers: usersResult.rows.map(row => ({
          userId: row.user_id,
          count: parseInt(row.count)
        }))
      };
    } catch (error) {
      console.error('❌ Failed to get tenant audit summary:', error);
      throw new Error(`Failed to get tenant audit summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Convenience methods for common audit scenarios
  async logUserLogin(tenantId: string, userId: string, success: boolean, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logSecurityEvent({
      type: success ? 'login_success' : 'login_failure',
      tenantId,
      userId,
      details: { success, timestamp: new Date().toISOString() },
      ipAddress,
      userAgent,
      severity: success ? 'low' : 'medium'
    });
  }

  async logDataAccess(tenantId: string, userId: string, resource: string, resourceId: string, action: string): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: `data_${action}`,
      resource,
      resourceId,
      severity: 'low'
    });
  }

  async logPermissionChange(tenantId: string, adminUserId: string, targetUserId: string, changes: Record<string, any>): Promise<void> {
    await this.log({
      tenantId,
      userId: adminUserId,
      action: 'permission_change',
      resource: 'user_permissions',
      resourceId: targetUserId,
      details: { changes, targetUserId },
      severity: 'high'
    });
  }

  async logSuspiciousActivity(tenantId: string, userId: string, activityType: string, details: Record<string, any>, ipAddress?: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'suspicious_activity',
      tenantId,
      userId,
      details: { activityType, ...details },
      ipAddress,
      severity: 'high'
    });
  }

  private formatAuditLog(row: any): AuditLogEntry {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      userId: row.user_id,
      action: row.action,
      resource: row.resource,
      resourceId: row.resource_id,
      details: row.details,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      sessionId: row.session_id,
      severity: row.severity,
      timestamp: row.timestamp.toISOString(),
      metadata: row.metadata
    };
  }

  async cleanup(retentionDays: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const pool = await dbManager.getPool('tenant_management');
      
      // Clean up audit logs
      const auditResult = await pool.query(
        'DELETE FROM tenant_management.audit_logs WHERE timestamp < $1',
        [cutoffDate.toISOString()]
      );

      // Clean up security events (keep longer for security analysis)
      const securityCutoff = new Date();
      securityCutoff.setDate(securityCutoff.getDate() - (retentionDays * 2));
      
      const securityResult = await pool.query(
        'DELETE FROM tenant_management.security_events WHERE timestamp < $1 AND resolved = true',
        [securityCutoff.toISOString()]
      );

      const totalDeleted = (auditResult.rowCount || 0) + (securityResult.rowCount || 0);
      console.log(`🧹 Cleaned up ${totalDeleted} old audit records`);
      
      return totalDeleted;
    } catch (error) {
      console.error('❌ Failed to cleanup audit logs:', error);
      throw new Error(`Failed to cleanup audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Flush any remaining logs
    await this.flushBuffer();
    console.log('✅ Audit service shutdown complete');
  }

  getHealth(): { status: string; bufferSize: number; initialized: boolean } {
    return {
      status: this.isInitialized ? 'healthy' : 'initializing',
      bufferSize: this.logBuffer.length,
      initialized: this.isInitialized
    };
  }
}

export const auditService = new AuditService();
export default auditService; 