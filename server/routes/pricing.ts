import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pricingService } from '../services/pricingService';
import { auditService } from '../services/auditService';
import { authenticateMultiTenant, requireRoles } from '../middleware/multiTenantMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateMultiTenant);

// Validation schemas
const createPricingCardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  interval: z.enum(['day', 'week', 'month', 'year']).optional(),
  features: z.array(z.string()).optional(),
  limits: z.record(z.number()).optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
});

const updatePricingCardSchema = createPricingCardSchema.partial();

const setSubscriptionSchema = z.object({
  cardId: z.string().uuid('Invalid card ID'),
  startDate: z.string().datetime().optional(),
  paymentMethod: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  autoRenew: z.boolean().optional()
});

/**
 * GET /api/pricing/plans
 * Get all available pricing plans
 */
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await pricingService.listPricingCards({ activeOnly: true });
    
    res.json({
      success: true,
      message: 'Pricing plans retrieved successfully',
      data: { plans }
    });
  } catch (error) {
    console.error('Get pricing plans error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve pricing plans'
      }
    });
  }
});

/**
 * POST /api/pricing/cards
 * Create a new pricing card (Admin only)
 */
router.post('/cards', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const cardData = req.body;
    const newCard = await pricingService.createPricingCard(cardData);
    
    res.status(201).json({
      success: true,
      message: 'Pricing card created successfully',
      data: { card: newCard }
    });
  } catch (error) {
    console.error('Create pricing card error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create pricing card'
      }
    });
  }
});

/**
 * GET /api/pricing/cards
 * Get all pricing cards (Admin only)
 */
router.get('/cards', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const { activeOnly } = req.query;
    const cards = await pricingService.listPricingCards({ 
      activeOnly: activeOnly === 'true' 
    });
    
    res.json({
      success: true,
      message: 'Pricing cards retrieved successfully',
      data: { cards }
    });
  } catch (error) {
    console.error('Get pricing cards error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve pricing cards'
      }
    });
  }
});

/**
 * GET /api/pricing/cards/:cardId
 * Get a specific pricing card
 */
router.get('/cards/:cardId', async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const card = await pricingService.getPricingCard(cardId);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Pricing card not found'
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Pricing card retrieved successfully',
      data: { card }
    });
  } catch (error) {
    console.error('Get pricing card error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve pricing card'
      }
    });
  }
});

/**
 * PUT /api/pricing/cards/:cardId
 * Update a pricing card (Admin only)
 */
router.put('/cards/:cardId', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const updateData = req.body;
    
    const updatedCard = await pricingService.updatePricingCard(cardId, updateData);
    
    res.json({
      success: true,
      message: 'Pricing card updated successfully',
      data: { card: updatedCard }
    });
  } catch (error) {
    console.error('Update pricing card error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update pricing card'
      }
    });
  }
});

/**
 * DELETE /api/pricing/cards/:cardId
 * Delete a pricing card (Admin only)
 */
router.delete('/cards/:cardId', requireRoles(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    
    const deleted = await pricingService.deletePricingCard(cardId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Pricing card not found'
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Pricing card deleted successfully'
    });
  } catch (error) {
    console.error('Delete pricing card error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete pricing card'
      }
    });
  }
});

/**
 * GET /api/pricing/subscription
 * Get current tenant subscription
 */
router.get('/subscription', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.auth!;
    
    const subscription = await pricingService.getTenantSubscription(tenantId);
    
    res.json({
      success: true,
      message: 'Subscription retrieved successfully',
      data: { subscription }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve subscription'
      }
    });
  }
});

/**
 * POST /api/pricing/subscription
 * Set tenant subscription (Admin only)
 */
router.post('/subscription', requireRoles(['admin', 'owner']), async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.auth!;
    const { cardId, options = {} } = req.body;
    
    const subscription = await pricingService.setTenantSubscription(tenantId, cardId, options);
    
    res.status(201).json({
      success: true,
      message: 'Subscription set successfully',
      data: { subscription }
    });
  } catch (error) {
    console.error('Set subscription error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to set subscription'
      }
    });
  }
});

/**
 * POST /api/pricing/subscription/cancel
 * Cancel tenant subscription (Admin only)
 */
router.post('/subscription/cancel', requireRoles(['admin', 'owner']), async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.auth!;
    const { endDate } = req.body;
    
    const cancelled = await pricingService.cancelTenantSubscription(tenantId, { endDate });
    
    if (!cancelled) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No active subscription found'
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to cancel subscription'
      }
    });
  }
});

/**
 * GET /api/pricing/features/:featureKey
 * Check if tenant has access to a specific feature
 */
router.get('/features/:featureKey', async (req: Request, res: Response) => {
  try {
    const { featureKey } = req.params;
    const { tenantId } = req.auth!;
    
    const hasAccess = await pricingService.hasTenantFeatureAccess(tenantId, featureKey);
    
    res.json({
      success: true,
      message: 'Feature access checked successfully',
      data: { hasAccess, feature: featureKey }
    });
  } catch (error) {
    console.error('Check feature access error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to check feature access'
      }
    });
  }
});

/**
 * GET /api/pricing/limits
 * Get tenant feature limits
 */
router.get('/limits', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.auth!;
    
    const limits = await pricingService.getTenantFeatureLimits(tenantId);
    
    res.json({
      success: true,
      message: 'Feature limits retrieved successfully',
      data: { limits }
    });
  } catch (error) {
    console.error('Get feature limits error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve feature limits'
      }
    });
  }
});

/**
 * POST /api/pricing/usage/:featureKey
 * Track feature usage
 */
router.post('/usage/:featureKey', async (req: Request, res: Response) => {
  try {
    const { featureKey } = req.params;
    const { tenantId } = req.auth!;
    const { usage = 1 } = req.body;
    
    const tracked = await pricingService.trackFeatureUsage(tenantId, featureKey, usage);
    
    res.json({
      success: true,
      message: 'Feature usage tracked successfully',
      data: { tracked, feature: featureKey, usage }
    });
  } catch (error) {
    console.error('Track feature usage error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to track feature usage'
      }
    });
  }
});

// Get pricing service health
router.get('/health', async (req, res) => {
  try {
    const health = pricingService.getHealth();
    res.json(health);
  } catch (error) {
    console.error('Error getting pricing service health:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get health status' });
  }
});

export default router; 