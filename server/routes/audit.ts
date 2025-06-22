import { Router } from 'express';
import { z } from 'zod';
import { auditService } from '../services/auditService';
import { authenticateMultiTenant, requireRoles } from '../middleware/multiTenantMiddleware';

const router = Router();

// Validation schemas
const auditQuerySchema = z.object({
  action: z.string().optional(),
  resource: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional()
});

const createAuditLogSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  resource: z.string().min(1, 'Resource is required'),
  resourceId: z.string().optional(),
  details: z.record(z.any()).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  metadata: z.record(z.any()).optional()
});

const securityEventSchema = z.object({
  type: z.enum(['login_attempt', 'login_success', 'login_failure', 'password_change', 'permission_change', 'data_access', 'suspicious_activity']),
  details: z.record(z.any()),
  severity: z.enum(['low', 'medium', 'high', 'critical'])
});

// Query audit logs (admin only)
router.get('/logs', authenticateMultiTenant, requireRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const queryParams = auditQuerySchema.parse(req.query);
    const { tenantId } = req.auth!;

    // Add tenant filter for non-super-admin users
    const query = {
      ...queryParams,
      tenantId: req.auth!.role === 'super_admin' ? undefined : tenantId
    };

    const result = await auditService.queryLogs(query);

    res.json({
      success: true,
      data: result.logs,
      pagination: {
        total: result.total,
        limit: queryParams.limit || 100,
        offset: queryParams.offset || 0,
        hasMore: (queryParams.offset || 0) + result.logs.length < result.total
      }
    });
  } catch (error) {
    console.error('Error querying audit logs:', error);
    res.status(400).json({
      success: false,
      message: error instanceof z.ZodError ? 'Invalid query parameters' : 'Failed to query audit logs',
      errors: error instanceof z.ZodError ? error.errors : undefined
    });
  }
});

// Get tenant audit summary (admin only)
router.get('/summary', authenticateMultiTenant, requireRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { tenantId } = req.auth!;
    const days = parseInt(req.query.days as string) || 30;

    const summary = await auditService.getTenantAuditSummary(tenantId, days);

    res.json({
      success: true,
      data: summary,
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting audit summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit summary'
    });
  }
});

// Create manual audit log entry (admin only)
router.post('/logs', authenticateMultiTenant, requireRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const logData = createAuditLogSchema.parse(req.body);
    const { tenantId, userId } = req.auth!;

    await auditService.log({
      ...logData,
      tenantId,
      userId: userId.toString(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Audit log entry created successfully'
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(400).json({
      success: false,
      message: error instanceof z.ZodError ? 'Invalid request data' : 'Failed to create audit log',
      errors: error instanceof z.ZodError ? error.errors : undefined
    });
  }
});

// Log security event (admin only)
router.post('/security-events', authenticateMultiTenant, requireRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const eventData = securityEventSchema.parse(req.body);
    const { tenantId, userId } = req.auth!;

    await auditService.logSecurityEvent({
      ...eventData,
      tenantId,
      userId: userId.toString(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Security event logged successfully'
    });
  } catch (error) {
    console.error('Error logging security event:', error);
    res.status(400).json({
      success: false,
      message: error instanceof z.ZodError ? 'Invalid request data' : 'Failed to log security event',
      errors: error instanceof z.ZodError ? error.errors : undefined
    });
  }
});

// Convenience endpoints for common audit scenarios
router.post('/user-login', authenticateMultiTenant, async (req, res) => {
  try {
    const { success: loginSuccess, targetUserId } = req.body;
    const { tenantId } = req.auth!;

    await auditService.logUserLogin(
      tenantId,
      targetUserId,
      loginSuccess,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'User login logged successfully'
    });
  } catch (error) {
    console.error('Error logging user login:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log user login'
    });
  }
});

router.post('/data-access', authenticateMultiTenant, async (req, res) => {
  try {
    const { resource, resourceId, action } = req.body;
    const { tenantId, userId } = req.auth!;

    await auditService.logDataAccess(tenantId, userId.toString(), resource, resourceId, action);

    res.json({
      success: true,
      message: 'Data access logged successfully'
    });
  } catch (error) {
    console.error('Error logging data access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log data access'
    });
  }
});

router.post('/permission-change', authenticateMultiTenant, requireRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { targetUserId, changes } = req.body;
    const { tenantId, userId } = req.auth!;

    await auditService.logPermissionChange(tenantId, userId.toString(), targetUserId, changes);

    res.json({
      success: true,
      message: 'Permission change logged successfully'
    });
  } catch (error) {
    console.error('Error logging permission change:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log permission change'
    });
  }
});

router.post('/suspicious-activity', authenticateMultiTenant, async (req, res) => {
  try {
    const { activityType, details } = req.body;
    const { tenantId, userId } = req.auth!;

    await auditService.logSuspiciousActivity(
      tenantId,
      userId.toString(),
      activityType,
      details,
      req.ip
    );

    res.json({
      success: true,
      message: 'Suspicious activity logged successfully'
    });
  } catch (error) {
    console.error('Error logging suspicious activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log suspicious activity'
    });
  }
});

// Cleanup old audit logs (super admin only)
router.post('/cleanup', authenticateMultiTenant, requireRoles(['super_admin']), async (req, res) => {
  try {
    const { retentionDays = 365 } = req.body;
    const { tenantId, userId } = req.auth!;

    const deletedCount = await auditService.cleanup(retentionDays);

    // Log the cleanup action
    await auditService.log({
      tenantId,
      userId: userId.toString(),
      action: 'audit_cleanup',
      resource: 'audit_logs',
      details: {
        retentionDays,
        deletedCount
      },
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        deletedCount,
        retentionDays
      },
      message: `Cleaned up ${deletedCount} old audit records`
    });
  } catch (error) {
    console.error('Error cleaning up audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup audit logs'
    });
  }
});

// Export audit logs (admin only)
router.get('/export', authenticateMultiTenant, requireRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const queryParams = auditQuerySchema.parse(req.query);
    const { tenantId, userId } = req.auth!;

    // Add tenant filter for non-super-admin users
    const query = {
      ...queryParams,
      tenantId: req.auth!.role === 'super_admin' ? undefined : tenantId,
      limit: 10000 // Higher limit for export
    };

    const result = await auditService.queryLogs(query);

    // Log the export action
    await auditService.log({
      tenantId,
      userId: userId.toString() ,
      action: 'export_audit_logs',
      resource: 'audit_logs',
      details: {
        exportedCount: result.logs.length,
        query: queryParams
      },
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);

    // Generate CSV
    const csvHeaders = 'Timestamp,Tenant ID,User ID,Action,Resource,Resource ID,Severity,IP Address,Details\n';
    const csvRows = result.logs.map(log => [
      log.timestamp,
      log.tenantId || '',
      log.userId || '',
      log.action,
      log.resource,
      log.resourceId || '',
      log.severity,
      log.ipAddress || '',
      `"${JSON.stringify(log.details).replace(/"/g, '""')}"`
    ].join(',')).join('\n');

    res.send(csvHeaders + csvRows);
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(400).json({
      success: false,
      message: error instanceof z.ZodError ? 'Invalid query parameters' : 'Failed to export audit logs',
      errors: error instanceof z.ZodError ? error.errors : undefined
    });
  }
});

// Get audit service health
router.get('/health', async (req, res) => {
  try {
    const health = auditService.getHealth();
    res.json(health);
  } catch (error) {
    console.error('Error getting audit service health:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get health status' });
  }
});

export default router; 