import { dbManager } from '../db';
import { EnhancedUser, UserRole, Permission, TenantContext } from '../types/enhanced-types';

/**
 * RBAC Service for Multi-Tenant Role-Based Access Control
 * 
 * Provides comprehensive role and permission management with tenant isolation.
 * Supports hierarchical permissions and dynamic role assignment.
 */
export class RBACService {
  private permissionCache: Map<string, Permission[]> = new Map();
  private rolePermissionCache: Map<string, Permission[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if user has specific permission
   */
  async hasPermission(
    tenantId: string, 
    userId: number, 
    resource: string, 
    action: string
  ): Promise<boolean> {
    try {
      const cacheKey = `${tenantId}:${userId}:permissions`;
      
      // Check cache first
      let permissions = this.getFromCache(cacheKey);
      if (!permissions) {
        permissions = await this.getUserPermissions(tenantId, userId);
        this.setCache(cacheKey, permissions);
      }

      // Check if user has the specific permission
      return permissions.some((permission: Permission) => 
        permission.resource === resource && permission.action === action
      );
    } catch (error) {
      console.error(`Error checking permission for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(
    tenantId: string,
    userId: number,
    permissionChecks: Array<{ resource: string; action: string }>
  ): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(tenantId, userId);
      
      return permissionChecks.some(check =>
        permissions.some(permission =>
          permission.resource === check.resource && permission.action === check.action
        )
      );
    } catch (error) {
      console.error(`Error checking permissions for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Check if user has specific role
   */
  async hasRole(tenantId: string, userId: number, role: UserRole): Promise<boolean> {
    try {
      const user = await this.getUser(tenantId, userId);
      return user?.role === role;
    } catch (error) {
      console.error(`Error checking role for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(tenantId: string, userId: number, roles: UserRole[]): Promise<boolean> {
    try {
      const user = await this.getUser(tenantId, userId);
      return user ? roles.includes(user.role) : false;
    } catch (error) {
      console.error(`Error checking roles for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(tenantId: string, userId: number): Promise<Permission[]> {
    try {
      const result = await dbManager.queryForTenant(
        tenantId,
        `
        SELECT DISTINCT p.id, p.name, p.resource, p.action, p.description
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        INNER JOIN users u ON u.role = rp.role
        WHERE u.id = $1 AND u.tenant_id = $2
        UNION
        SELECT DISTINCT p.id, p.name, p.resource, p.action, p.description
        FROM permissions p
        INNER JOIN user_permissions up ON p.id = up.permission_id
        WHERE up.user_id = $1 AND up.tenant_id = $2
        `,
        [userId, tenantId]
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        resource: row.resource,
        action: row.action,
        description: row.description
      }));
    } catch (error) {
      console.error(`Error getting permissions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get permissions for a specific role
   */
  async getRolePermissions(tenantId: string, role: UserRole): Promise<Permission[]> {
    try {
      const cacheKey = `${tenantId}:role:${role}:permissions`;
      
      // Check cache first
      let permissions = this.getFromCache(cacheKey);
      if (!permissions) {
        const result = await dbManager.queryForTenant(
          tenantId,
          `
          SELECT p.id, p.name, p.resource, p.action, p.description
          FROM permissions p
          INNER JOIN role_permissions rp ON p.id = rp.permission_id
          WHERE rp.role = $1
          `,
          [role]
        );

        permissions = result.rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          resource: row.resource,
          action: row.action,
          description: row.description
        }));

        this.setCache(cacheKey, permissions);
      }

      return permissions;
    } catch (error) {
      console.error(`Error getting permissions for role ${role}:`, error);
      return [];
    }
  }

  /**
   * Assign permission to user
   */
  async assignPermissionToUser(
    tenantId: string,
    userId: number,
    permissionId: string,
    assignedBy: number
  ): Promise<void> {
    try {
      await dbManager.queryForTenant(
        tenantId,
        `
        INSERT INTO user_permissions (user_id, permission_id, tenant_id, assigned_by, assigned_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (user_id, permission_id, tenant_id) DO NOTHING
        `,
        [userId, permissionId, tenantId, assignedBy]
      );

      // Clear cache for this user
      this.clearUserCache(tenantId, userId);
    } catch (error) {
      console.error(`Error assigning permission ${permissionId} to user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Remove permission from user
   */
  async removePermissionFromUser(
    tenantId: string,
    userId: number,
    permissionId: string
  ): Promise<void> {
    try {
      await dbManager.queryForTenant(
        tenantId,
        `
        DELETE FROM user_permissions 
        WHERE user_id = $1 AND permission_id = $2 AND tenant_id = $3
        `,
        [userId, permissionId, tenantId]
      );

      // Clear cache for this user
      this.clearUserCache(tenantId, userId);
    } catch (error) {
      console.error(`Error removing permission ${permissionId} from user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(
    tenantId: string,
    userId: number,
    newRole: UserRole,
    updatedBy: number
  ): Promise<void> {
    try {
      await dbManager.transactionForTenant(tenantId, async (client) => {
        // Update user role
        await client.query(
          `
          UPDATE users 
          SET role = $1, updated_at = NOW(), updated_by = $2
          WHERE id = $3 AND tenant_id = $4
          `,
          [newRole, updatedBy, userId, tenantId]
        );

        // Log role change
        await client.query(
          `
          INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, details, ip_address, user_agent, timestamp)
          VALUES ($1, $2, 'role_change', 'user', $3, $4, '', '', NOW())
          `,
          [
            tenantId,
            updatedBy,
            userId.toString(),
            JSON.stringify({ oldRole: null, newRole, updatedBy })
          ]
        );
      });

      // Clear cache for this user
      this.clearUserCache(tenantId, userId);
    } catch (error) {
      console.error(`Error updating role for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user with role and permissions
   */
  async getUser(tenantId: string, userId: number): Promise<EnhancedUser | null> {
    try {
      const result = await dbManager.queryForTenant(
        tenantId,
        `
        SELECT id, username, email, first_name, last_name, role, status, tenant_id, last_login, created_at, updated_at
        FROM users 
        WHERE id = $1 AND tenant_id = $2
        `,
        [userId, tenantId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      const permissions = await this.getUserPermissions(tenantId, userId);

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        permissions,
        status: user.status,
        isActive: user.status === 'active',
        tenantId: user.tenant_id,
        lastLoginAt: user.last_login?.toISOString(),
        createdAt: user.created_at.toISOString(),
        updatedAt: user.updated_at.toISOString()
      };
    } catch (error) {
      console.error(`Error getting user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Create tenant context with user and permissions
   */
  async createTenantContext(tenantId: string, userId: number): Promise<TenantContext | null> {
    try {
      // Get tenant information
      const tenantResult = await dbManager.getMainPool().query(
        'SELECT * FROM tenant_management.tenants WHERE tenant_id = $1',
        [tenantId]
      );

      if (tenantResult.rows.length === 0) {
        throw new Error(`Tenant not found: ${tenantId}`);
      }

      // Get user with permissions
      const user = await this.getUser(tenantId, userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      const tenant = tenantResult.rows[0];

      return {
        tenantId,
        tenantName: tenant.tenant_name,
        user,
        permissions: user.permissions,
        subscription: {
          planId: tenant.subscription_plan,
          planName: tenant.subscription_plan,
          status: tenant.status === 'active' ? 'active' : 'cancelled',
          startDate: tenant.created_at.toISOString(),
          features: [],
          limits: {}
        },
        settings: tenant.settings || {}
      };
    } catch (error) {
      console.error(`Error creating tenant context for ${tenantId}:${userId}:`, error);
      return null;
    }
  }

  /**
   * Validate tenant access for user
   */
  async validateTenantAccess(tenantId: string, userId: number): Promise<boolean> {
    try {
      const result = await dbManager.queryForTenant(
        tenantId,
        'SELECT 1 FROM users WHERE id = $1 AND tenant_id = $2 AND status = $3',
        [userId, tenantId, 'active']
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error(`Error validating tenant access for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get all available permissions
   */
  async getAllPermissions(tenantId: string): Promise<Permission[]> {
    try {
      const result = await dbManager.queryForTenant(
        tenantId,
        'SELECT id, name, resource, action, description FROM permissions ORDER BY resource, action'
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        resource: row.resource,
        action: row.action,
        description: row.description
      }));
    } catch (error) {
      console.error('Error getting all permissions:', error);
      return [];
    }
  }

  /**
   * Cache management methods
   */
  private getFromCache(key: string): any {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.permissionCache.delete(key);
      this.rolePermissionCache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }

    return this.permissionCache.get(key) || this.rolePermissionCache.get(key);
  }

  private setCache(key: string, value: any): void {
    if (key.includes(':permissions')) {
      this.permissionCache.set(key, value);
    } else {
      this.rolePermissionCache.set(key, value);
    }
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }

  private clearUserCache(tenantId: string, userId: number): void {
    const userCacheKey = `${tenantId}:${userId}:permissions`;
    this.permissionCache.delete(userCacheKey);
    this.cacheExpiry.delete(userCacheKey);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.permissionCache.clear();
    this.rolePermissionCache.clear();
    this.cacheExpiry.clear();
  }
}

// Export singleton instance
export const rbacService = new RBACService(); 