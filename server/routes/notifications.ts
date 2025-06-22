import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { notificationService } from '../services/notificationService';
import { auditService } from '../services/auditService';
import { authenticateMultiTenant, requireRoles } from '../middleware/multiTenantMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateMultiTenant);

// Validation schemas
const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().optional(),
  template: z.string(),
  data: z.record(z.any()).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string().optional()
  })).optional()
});

const sendNotificationSchema = z.object({
  type: z.string(),
  data: z.record(z.any()),
  userId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  channels: z.array(z.enum(['email', 'push', 'webhook'])).optional()
});

const sendPushSchema = z.object({
  userId: z.string(),
  title: z.string(),
  body: z.string(),
  data: z.record(z.any()).optional(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  actions: z.array(z.object({
    action: z.string(),
    title: z.string(),
    icon: z.string().optional()
  })).optional()
});

const sendWebhookSchema = z.object({
  url: z.string().url(),
  event: z.string(),
  data: z.record(z.any()),
  retryCount: z.number().optional(),
  timeout: z.number().optional()
});

/**
 * GET /api/notifications
 * Get notifications for the authenticated user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.auth!;
    const { 
      unreadOnly = false, 
      type, 
      limit = 50, 
      offset = 0 
    } = req.query;

    const notifications = await notificationService.getUserNotifications(
      tenantId,
      userId.toString(),
      {
        unreadOnly: unreadOnly === 'true',
        type: type as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    );

    res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: { notifications }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve notifications'
      }
    });
  }
});

/**
 * GET /api/notifications/count
 * Get unread notification count for the authenticated user
 */
router.get('/count', async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.auth!;
    
    const count = await notificationService.getUnreadCount(tenantId, userId.toString());

    res.json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: { count }
    });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve notification count'
      }
    });
  }
});

/**
 * POST /api/notifications
 * Send a notification (Admin only)
 */
router.post('/', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.auth!;
    const notificationData = req.body;
    
    // Ensure tenant context
    notificationData.tenantId = tenantId;
    notificationData.fromUserId = userId;

    const notification = await notificationService.createNotification(notificationData);

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: { notification }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to send notification'
      }
    });
  }
});

/**
 * PUT /api/notifications/:notificationId/read
 * Mark a notification as read
 */
router.put('/:notificationId/read', async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const { tenantId, userId } = req.auth!;

    const success = await notificationService.markAsRead(tenantId, userId.toString(), notificationId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to mark notification as read'
      }
    });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the user
 */
router.put('/read-all', async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.auth!;

    const count = await notificationService.markAllAsRead(tenantId, userId.toString());

    res.json({
      success: true,
      message: `${count} notifications marked as read`,
      data: { count }
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to mark all notifications as read'
      }
    });
  }
});

/**
 * DELETE /api/notifications/:notificationId
 * Delete a notification
 */
router.delete('/:notificationId', async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const { tenantId, userId } = req.auth!;

    const success = await notificationService.deleteNotification(tenantId, userId.toString(), notificationId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete notification'
      }
    });
  }
});

/**
 * GET /api/notifications/preferences
 * Get notification preferences for the user
 */
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.auth!;

    const preferences = await notificationService.getUserPreferences(tenantId, userId.toString());

    res.json({
      success: true,
      message: 'Notification preferences retrieved successfully',
      data: { preferences }
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve notification preferences'
      }
    });
  }
});

/**
 * PUT /api/notifications/preferences
 * Update notification preferences for the user
 */
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.auth!;
    const preferences = req.body;

    const updatedPreferences = await notificationService.updateUserPreferences(
      tenantId, 
      userId.toString(), 
      preferences
    );

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: { preferences: updatedPreferences }
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update notification preferences'
      }
    });
  }
});

/**
 * POST /api/notifications/broadcast
 * Send broadcast notification to all users in tenant (Admin only)
 */
router.post('/broadcast', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.auth!;
    const { message, type = 'system', priority = 'medium' } = req.body;

    const count = await notificationService.broadcastToTenant(tenantId, {
      message,
      type,
      priority,
      fromUserId: userId.toString()
    });

    res.json({
      success: true,
      message: `Broadcast sent to ${count} users`,
      data: { recipientCount: count }
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to send broadcast notification'
      }
    });
  }
});

/**
 * GET /api/notifications/templates
 * Get notification templates (Admin only)
 */
router.get('/templates', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const templates = await notificationService.getNotificationTemplates();

    res.json({
      success: true,
      message: 'Notification templates retrieved successfully',
      data: { templates }
    });
  } catch (error) {
    console.error('Get notification templates error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve notification templates'
      }
    });
  }
});

/**
 * POST /api/notifications/test
 * Send test notification (Admin only)
 */
router.post('/test', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.auth!;
    const { channels = ['in_app'], message = 'Test notification' } = req.body;

    const success = await notificationService.sendTestNotification(tenantId, userId.toString(), {
      message,
      channels,
      type: 'test'
    });

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: { sent: success }
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to send test notification'
      }
    });
  }
});

// Send email notification
router.post('/email', requireRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const emailData = sendEmailSchema.parse(req.body);
    const { tenantId, userId } = req.auth!;

    const success = await notificationService.sendEmail({
      ...emailData,
      subject: emailData.subject || 'Notification',
      data: {
        ...emailData.data,
        tenantId
      }
    });

    // Audit log
    await auditService.log({
      tenantId,
      userId: userId.toString(),
      action: 'send_email_notification',
      resource: 'notifications',
      details: {
        to: emailData.to,
        template: emailData.template,
        success
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    if (success) {
      res.json({ success: true, message: 'Email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(400).json({ 
      success: false, 
      message: error instanceof z.ZodError ? 'Invalid request data' : 'Failed to send email',
      errors: error instanceof z.ZodError ? error.errors : undefined
    });
  }
});

// Send system notification
router.post('/system', requireRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const notificationData = sendNotificationSchema.parse(req.body);
    const { tenantId, userId } = req.auth!;

    const success = await notificationService.sendSystemNotification({
      ...notificationData,
      tenantId,
      data: {
        ...notificationData.data,
        tenantId
      }
    });

    // Audit log
    await auditService.log({
      tenantId,
      userId: userId.toString(),
      action: 'send_system_notification',
      resource: 'notifications',
      details: {
        type: notificationData.type,
        priority: notificationData.priority,
        success
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    if (success) {
      res.json({ success: true, message: 'Notification sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send notification' });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(400).json({ 
      success: false, 
      message: error instanceof z.ZodError ? 'Invalid request data' : 'Failed to send notification',
      errors: error instanceof z.ZodError ? error.errors : undefined
    });
  }
});

// Send push notification
router.post('/push', requireRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const pushData = sendPushSchema.parse(req.body);
    const { tenantId, userId } = req.auth!;

    const success = await notificationService.sendPushNotification({
      ...pushData,
      data: {
        ...pushData.data,
        tenantId
      }
    });

    // Audit log
    await auditService.log({
      tenantId,
      userId: userId.toString(),
      action: 'send_push_notification',
      resource: 'notifications',
      details: {
        targetUserId: pushData.userId,
        title: pushData.title,
        success
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    if (success) {
      res.json({ success: true, message: 'Push notification sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send push notification' });
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(400).json({ 
      success: false, 
      message: error instanceof z.ZodError ? 'Invalid request data' : 'Failed to send push notification',
      errors: error instanceof z.ZodError ? error.errors : undefined
    });
  }
});

// Send webhook
router.post('/webhook', requireRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const webhookData = sendWebhookSchema.parse(req.body);
    const { tenantId, userId } = req.auth!;

    const success = await notificationService.sendWebhook({
      ...webhookData,
      data: {
        ...webhookData.data,
        tenantId
      }
    });

    // Audit log
    await auditService.log({
      tenantId,
      userId: userId.toString(),
      action: 'send_webhook',
      resource: 'notifications',
      details: {
        url: webhookData.url,
        event: webhookData.event,
        success
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    if (success) {
      res.json({ success: true, message: 'Webhook sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send webhook' });
    }
  } catch (error) {
    console.error('Error sending webhook:', error);
    res.status(400).json({ 
      success: false, 
      message: error instanceof z.ZodError ? 'Invalid request data' : 'Failed to send webhook',
      errors: error instanceof z.ZodError ? error.errors : undefined
    });
  }
});

// Convenience endpoints for common scenarios
router.post('/price-alert', requireRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { symbol, alertType, currentPrice, targetPrice, priceChange, email } = req.body;
    const { tenantId, userId } = req.auth!;

    const success = await notificationService.sendPriceAlert({
      tenantId,
      userId: userId.toString(),
      symbol,
      alertType,
      currentPrice,
      targetPrice,
      priceChange,
      email,
      tradingUrl: `${req.protocol}://${req.get('host')}/trading?symbol=${symbol}`
    });

    res.json({ success, message: success ? 'Price alert sent' : 'Failed to send price alert' });
  } catch (error) {
    console.error('Error sending price alert:', error);
    res.status(500).json({ success: false, message: 'Failed to send price alert' });
  }
});

router.post('/trade-executed', requireRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { symbol, orderType, quantity, price, totalValue, orderId, email } = req.body;
    const { tenantId, userId } = req.auth!;

    const success = await notificationService.sendTradeExecutedNotification({
      tenantId,
      userId,
      symbol,
      orderType,
      quantity,
      price,
      totalValue,
      orderId,
      email,
      portfolioUrl: `${req.protocol}://${req.get('host')}/portfolio`
    });

    res.json({ success, message: success ? 'Trade notification sent' : 'Failed to send trade notification' });
  } catch (error) {
    console.error('Error sending trade notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send trade notification' });
  }
});

router.post('/security-alert', requireRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { alertType, location, email } = req.body;
    const { tenantId, userId } = req.auth!;

    const success = await notificationService.sendSecurityAlert({
      tenantId,
      userId,
      alertType,
      ipAddress: req.ip,
      location,
      userAgent: req.get('User-Agent'),
      email,
      securityUrl: `${req.protocol}://${req.get('host')}/settings/security`
    });

    res.json({ success, message: success ? 'Security alert sent' : 'Failed to send security alert' });
  } catch (error) {
    console.error('Error sending security alert:', error);
    res.status(500).json({ success: false, message: 'Failed to send security alert' });
  }
});

// Get notification service health
router.get('/health', async (req, res) => {
  try {
    const health = notificationService.getHealth();
    res.json(health);
  } catch (error) {
    console.error('Error getting notification service health:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get health status' });
  }
});

export default router; 