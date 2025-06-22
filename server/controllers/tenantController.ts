import { Request, Response } from 'express';
import { dbManager } from '../db';
import { rbacService } from '../services/rbacService';

/**
 * Tenant Management Controller
 * 
 * Handles tenant CRUD operations, provisioning, and management
 */
export class TenantController {
  
  /**
   * Get all tenants (Super Admin only)
   */
  async getAllTenants(req: Request, res: Response): Promise<void> {
    try {
      // First get all tenants
      const tenantsResult = await dbManager.getMainPool().query<{
        tenant_id: string;
        tenant_name: string;
        status: string;
        subscription_plan: string;
        settings: any;
        created_at: Date;
        updated_at: Date;
      }>(`
        SELECT 
          tenant_id,
          tenant_name,
          status,
          subscription_plan,
          settings,
          created_at,
          updated_at
        FROM tenant_management.tenants 
        ORDER BY created_at DESC
      `);

      // Then get active users count for each tenant
      const tenants = await Promise.all(tenantsResult.rows.map(async (tenant) => {
        const activeUsersResult = await dbManager.getMainPool().query<{ active_users: number }>(`
          SELECT COUNT(*) as active_users 
          FROM tenant_${tenant.tenant_id.replace(/-/g, '_')}.users 
          WHERE status = 'active'
        `);

        return {
          id: tenant.tenant_id,
          name: tenant.tenant_name,
          status: tenant.status,
          subscriptionPlan: tenant.subscription_plan,
          settings: tenant.settings || {},
          activeUsers: parseInt(activeUsersResult.rows[0]?.active_users?.toString() || '0'),
          createdAt: tenant.created_at.toISOString(),
          updatedAt: tenant.updated_at.toISOString()
        };
      }));

      res.json({
        success: true,
        message: 'Tenants retrieved successfully',
        data: tenants,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting all tenants:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tenants',
        code: 'TENANT_RETRIEVAL_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      
      // Validate access - users can only access their own tenant unless super admin
      if (req.tenantId !== tenantId && !await rbacService.hasRole(req.tenantId!, req.userId!, 'super_admin')) {
        res.status(403).json({
          success: false,
          message: 'Access denied to tenant information',
          code: 'TENANT_ACCESS_DENIED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await dbManager.getMainPool().query(`
        SELECT 
          tenant_id as id,
          tenant_name as name,
          status,
          subscription_plan,
          settings,
          created_at,
          updated_at
        FROM tenant_management.tenants 
        WHERE tenant_id = $1
      `, [tenantId]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Tenant not found',
          code: 'TENANT_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const tenant = result.rows[0];
      
      // Get additional tenant statistics
      const statsResult = await dbManager.queryForTenant(tenantId, `
        SELECT 
          (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL '30 days') as monthly_trades,
          (SELECT SUM(total_value) FROM portfolios) as total_portfolio_value
      `);

      const stats = statsResult.rows[0] || {};

      res.json({
        success: true,
        message: 'Tenant retrieved successfully',
        data: {
          id: tenant.id,
          name: tenant.name,
          status: tenant.status,
          subscriptionPlan: tenant.subscription_plan,
          settings: tenant.settings || {},
          statistics: {
            activeUsers: parseInt(stats.active_users) || 0,
            totalUsers: parseInt(stats.total_users) || 0,
            monthlyTrades: parseInt(stats.monthly_trades) || 0,
            totalPortfolioValue: parseFloat(stats.total_portfolio_value) || 0
          },
          createdAt: tenant.created_at.toISOString(),
          updatedAt: tenant.updated_at.toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting tenant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tenant',
        code: 'TENANT_RETRIEVAL_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create new tenant (Super Admin only)
   */
  async createTenant(req: Request, res: Response): Promise<void> {
    try {
      const { name, subscriptionPlan, adminEmail, settings } = req.body;
      
      if (!name || !subscriptionPlan) {
        res.status(400).json({
          success: false,
          message: 'Tenant name and subscription plan are required',
          code: 'MISSING_REQUIRED_FIELDS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Generate tenant ID
      const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await dbManager.getMainPool().query('BEGIN');

      try {
        // Create tenant record
        await dbManager.getMainPool().query(`
          INSERT INTO tenant_management.tenants (
            tenant_id, tenant_name, status, subscription_plan, settings, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `, [tenantId, name, 'active', subscriptionPlan, JSON.stringify(settings || {})]);

        // Create tenant schema and tables
        await this.provisionTenantInfrastructure(tenantId);

        // Create admin user if email provided
        if (adminEmail) {
          await this.createTenantAdmin(tenantId, adminEmail, name);
        }

        await dbManager.getMainPool().query('COMMIT');

        res.status(201).json({
          success: true,
          message: 'Tenant created successfully',
          data: {
            id: tenantId,
            name,
            status: 'active',
            subscriptionPlan,
            settings: settings || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        await dbManager.getMainPool().query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create tenant',
        code: 'TENANT_CREATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update tenant settings
   */
  async updateTenant(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { name, status, subscriptionPlan, settings } = req.body;

      // Validate access
      if (req.tenantId !== tenantId && !await rbacService.hasRole(req.tenantId!, req.userId!, 'super_admin')) {
        res.status(403).json({
          success: false,
          message: 'Access denied to modify tenant',
          code: 'TENANT_MODIFY_DENIED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Build update query dynamically
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updateFields.push(`tenant_name = $${paramIndex++}`);
        values.push(name);
      }
      if (status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        values.push(status);
      }
      if (subscriptionPlan !== undefined) {
        updateFields.push(`subscription_plan = $${paramIndex++}`);
        values.push(subscriptionPlan);
      }
      if (settings !== undefined) {
        updateFields.push(`settings = $${paramIndex++}`);
        values.push(JSON.stringify(settings));
      }

      if (updateFields.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No fields to update',
          code: 'NO_UPDATE_FIELDS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(tenantId);

      const result = await dbManager.getMainPool().query(`
        UPDATE tenant_management.tenants 
        SET ${updateFields.join(', ')}
        WHERE tenant_id = $${paramIndex}
        RETURNING tenant_id as id, tenant_name as name, status, subscription_plan, settings, updated_at
      `, values);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Tenant not found',
          code: 'TENANT_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updatedTenant = result.rows[0];

      res.json({
        success: true,
        message: 'Tenant updated successfully',
        data: {
          id: updatedTenant.id,
          name: updatedTenant.name,
          status: updatedTenant.status,
          subscriptionPlan: updatedTenant.subscription_plan,
          settings: updatedTenant.settings || {},
          updatedAt: updatedTenant.updated_at.toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating tenant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update tenant',
        code: 'TENANT_UPDATE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete tenant (Super Admin only)
   */
  async deleteTenant(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { confirmDelete } = req.body;

      if (!confirmDelete) {
        res.status(400).json({
          success: false,
          message: 'Deletion confirmation required',
          code: 'DELETION_CONFIRMATION_REQUIRED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await dbManager.getMainPool().query('BEGIN');

      try {
        // Soft delete tenant (mark as inactive)
        const result = await dbManager.getMainPool().query(`
          UPDATE tenant_management.tenants 
          SET status = 'inactive', updated_at = NOW()
          WHERE tenant_id = $1
          RETURNING tenant_id
        `, [tenantId]);

        if (result.rows.length === 0) {
          await dbManager.getMainPool().query('ROLLBACK');
          res.status(404).json({
            success: false,
            message: 'Tenant not found',
            code: 'TENANT_NOT_FOUND',
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Deactivate all users in the tenant
        await dbManager.queryForTenant(tenantId, `
          UPDATE users SET status = 'inactive', updated_at = NOW()
          WHERE tenant_id = $1
        `, [tenantId]);

        await dbManager.getMainPool().query('COMMIT');

        res.json({
          success: true,
          message: 'Tenant deleted successfully',
          data: { tenantId },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        await dbManager.getMainPool().query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete tenant',
        code: 'TENANT_DELETION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { period = '30d' } = req.query;

      // Validate access
      if (req.tenantId !== tenantId && !await rbacService.hasRole(req.tenantId!, req.userId!, 'super_admin')) {
        res.status(403).json({
          success: false,
          message: 'Access denied to tenant usage data',
          code: 'TENANT_USAGE_ACCESS_DENIED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const interval = period === '7d' ? '7 days' : period === '90d' ? '90 days' : '30 days';

      const usageResult = await dbManager.queryForTenant(tenantId, `
        SELECT 
          COUNT(DISTINCT u.id) as active_users,
          COUNT(DISTINCT o.id) as total_trades,
          COALESCE(SUM(CASE WHEN o.side = 'buy' THEN o.quantity * o.price ELSE 0 END), 0) as buy_volume,
          COALESCE(SUM(CASE WHEN o.side = 'sell' THEN o.quantity * o.price ELSE 0 END), 0) as sell_volume,
          COUNT(DISTINCT p.id) as active_portfolios,
          COALESCE(AVG(p.total_value), 0) as avg_portfolio_value
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id AND o.created_at > NOW() - INTERVAL '${interval}'
        LEFT JOIN portfolios p ON u.id = p.user_id
        WHERE u.status = 'active' AND u.tenant_id = $1
      `, [tenantId]);

      const usage = usageResult.rows[0];

      // Get daily activity for the period
      const activityResult = await dbManager.queryForTenant(tenantId, `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as trades,
          SUM(quantity * price) as volume
        FROM orders 
        WHERE created_at > NOW() - INTERVAL '${interval}' AND tenant_id = $1
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, [tenantId]);

      res.json({
        success: true,
        message: 'Tenant usage retrieved successfully',
        data: {
          period,
          summary: {
            activeUsers: parseInt(usage.active_users) || 0,
            totalTrades: parseInt(usage.total_trades) || 0,
            buyVolume: parseFloat(usage.buy_volume) || 0,
            sellVolume: parseFloat(usage.sell_volume) || 0,
            activePortfolios: parseInt(usage.active_portfolios) || 0,
            avgPortfolioValue: parseFloat(usage.avg_portfolio_value) || 0
          },
          dailyActivity: activityResult.rows.map((row: any) => ({
            date: row.date,
            trades: parseInt(row.trades),
            volume: parseFloat(row.volume) || 0
          }))
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting tenant usage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tenant usage',
        code: 'TENANT_USAGE_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Provision tenant infrastructure (private method)
   */
  private async provisionTenantInfrastructure(tenantId: string): Promise<void> {
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    
    // Create tenant schema
    await dbManager.getMainPool().query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    
    // Create tenant-specific tables
    const tables = [
      `CREATE TABLE "${schemaName}".users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        tenant_id VARCHAR(255) NOT NULL,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE "${schemaName}".permissions (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        resource VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        description TEXT
      )`,
      
      `CREATE TABLE "${schemaName}".role_permissions (
        role VARCHAR(50) NOT NULL,
        permission_id VARCHAR(255) NOT NULL,
        PRIMARY KEY (role, permission_id),
        FOREIGN KEY (permission_id) REFERENCES "${schemaName}".permissions(id)
      )`,
      
      `CREATE TABLE "${schemaName}".user_permissions (
        user_id INTEGER NOT NULL,
        permission_id VARCHAR(255) NOT NULL,
        tenant_id VARCHAR(255) NOT NULL,
        assigned_by INTEGER,
        assigned_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, permission_id, tenant_id),
        FOREIGN KEY (user_id) REFERENCES "${schemaName}".users(id),
        FOREIGN KEY (permission_id) REFERENCES "${schemaName}".permissions(id)
      )`,
      
      `CREATE TABLE "${schemaName}".portfolios (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_id INTEGER NOT NULL,
        total_value DECIMAL(15,2) DEFAULT 0,
        available_cash DECIMAL(15,2) DEFAULT 0,
        total_return DECIMAL(15,2) DEFAULT 0,
        daily_pnl DECIMAL(15,2) DEFAULT 0,
        is_default BOOLEAN DEFAULT false,
        tenant_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES "${schemaName}".users(id)
      )`,
      
      `CREATE TABLE "${schemaName}".positions (
        id VARCHAR(255) PRIMARY KEY,
        portfolio_id VARCHAR(255) NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        quantity DECIMAL(15,4) NOT NULL,
        average_cost DECIMAL(15,4) NOT NULL,
        current_price DECIMAL(15,4) DEFAULT 0,
        market_value DECIMAL(15,2) DEFAULT 0,
        unrealized_pnl DECIMAL(15,2) DEFAULT 0,
        asset_type VARCHAR(50) DEFAULT 'stock',
        tenant_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (portfolio_id) REFERENCES "${schemaName}".portfolios(id)
      )`,
      
      `CREATE TABLE "${schemaName}".orders (
        id VARCHAR(255) PRIMARY KEY,
        portfolio_id VARCHAR(255) NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        side VARCHAR(10) NOT NULL,
        order_type VARCHAR(20) NOT NULL,
        quantity DECIMAL(15,4) NOT NULL,
        price DECIMAL(15,4),
        stop_price DECIMAL(15,4),
        status VARCHAR(20) DEFAULT 'pending',
        filled_quantity DECIMAL(15,4) DEFAULT 0,
        filled_price DECIMAL(15,4),
        time_in_force VARCHAR(10) DEFAULT 'day',
        tenant_id VARCHAR(255) NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        filled_at TIMESTAMP,
        FOREIGN KEY (portfolio_id) REFERENCES "${schemaName}".portfolios(id),
        FOREIGN KEY (user_id) REFERENCES "${schemaName}".users(id)
      )`,
      
      `CREATE TABLE "${schemaName}".audit_logs (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        user_id INTEGER,
        action VARCHAR(255) NOT NULL,
        resource VARCHAR(255) NOT NULL,
        resource_id VARCHAR(255),
        details JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES "${schemaName}".users(id)
      )`
    ];

    for (const tableSQL of tables) {
      await dbManager.getMainPool().query(tableSQL);
    }

    // Insert default permissions
    await this.insertDefaultPermissions(schemaName);
  }

  /**
   * Insert default permissions for tenant
   */
  private async insertDefaultPermissions(schemaName: string): Promise<void> {
    const permissions = [
      { id: 'trade:create', name: 'Create Trade', resource: 'trades', action: 'create' },
      { id: 'trade:read', name: 'Read Trades', resource: 'trades', action: 'read' },
      { id: 'trade:update', name: 'Update Trade', resource: 'trades', action: 'update' },
      { id: 'trade:delete', name: 'Delete Trade', resource: 'trades', action: 'delete' },
      { id: 'portfolio:create', name: 'Create Portfolio', resource: 'portfolios', action: 'create' },
      { id: 'portfolio:read', name: 'Read Portfolio', resource: 'portfolios', action: 'read' },
      { id: 'portfolio:update', name: 'Update Portfolio', resource: 'portfolios', action: 'update' },
      { id: 'portfolio:delete', name: 'Delete Portfolio', resource: 'portfolios', action: 'delete' },
      { id: 'user:create', name: 'Create User', resource: 'users', action: 'create' },
      { id: 'user:read', name: 'Read Users', resource: 'users', action: 'read' },
      { id: 'user:update', name: 'Update User', resource: 'users', action: 'update' },
      { id: 'user:delete', name: 'Delete User', resource: 'users', action: 'delete' }
    ];

    for (const permission of permissions) {
      await dbManager.getMainPool().query(`
        INSERT INTO "${schemaName}".permissions (id, name, resource, action, description)
        VALUES ($1, $2, $3, $4, $5)
      `, [permission.id, permission.name, permission.resource, permission.action, `Permission to ${permission.action} ${permission.resource}`]);
    }

    // Assign permissions to roles
    const rolePermissions = [
      // Admin permissions
      ...permissions.map(p => ({ role: 'admin', permissionId: p.id })),
      // User permissions (limited)
      { role: 'user', permissionId: 'trade:create' },
      { role: 'user', permissionId: 'trade:read' },
      { role: 'user', permissionId: 'portfolio:read' },
      { role: 'user', permissionId: 'portfolio:update' }
    ];

    for (const rp of rolePermissions) {
      await dbManager.getMainPool().query(`
        INSERT INTO "${schemaName}".role_permissions (role, permission_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [rp.role, rp.permissionId]);
    }
  }

  /**
   * Create tenant admin user
   */
  private async createTenantAdmin(tenantId: string, email: string, tenantName: string): Promise<void> {
    const bcrypt = require('bcrypt');
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    
    const hashedPassword = await bcrypt.hash('TempPassword123!', 10);
    const username = `admin_${tenantId.substr(-8)}`;

    await dbManager.getMainPool().query(`
      INSERT INTO "${schemaName}".users (
        username, email, password, first_name, last_name, role, status, tenant_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    `, [username, email, hashedPassword, 'Admin', tenantName, 'admin', 'active', tenantId]);
  }
}

// Export controller instance
export const tenantController = new TenantController(); 