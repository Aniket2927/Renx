-- Create demo user for testing authentication
-- First, provision the demo tenant schema (if not already done)
SELECT tenant_management.provision_tenant_schema('demo_tenant');

-- Insert demo user into the demo tenant schema
-- Password: 'demo123' (hashed with bcrypt)
INSERT INTO tenant_demo_tenant.users (
    username, 
    email, 
    password, 
    first_name, 
    last_name, 
    role, 
    status, 
    tenant_id
) VALUES (
    'demo_user',
    'demo@renx.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- demo123
    'Demo',
    'User',
    'user',
    'active',
    'demo_tenant'
) ON CONFLICT (email) DO NOTHING;

-- Create super admin user
INSERT INTO tenant_demo_tenant.users (
    username, 
    email, 
    password, 
    first_name, 
    last_name, 
    role, 
    status, 
    tenant_id
) VALUES (
    'superadmin',
    'admin@renx.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- demo123
    'Super',
    'Admin',
    'super_admin',
    'active',
    'demo_tenant'
) ON CONFLICT (email) DO NOTHING;

-- Insert default permissions using the tenant management function
SELECT tenant_management.insert_default_permissions('demo_tenant');

-- Create a default portfolio for the demo user
INSERT INTO tenant_demo_tenant.portfolios (
    id,
    name,
    user_id,
    total_value,
    available_cash,
    is_default,
    tenant_id
) SELECT 
    'demo-portfolio-' || u.id,
    'My Portfolio',
    u.id,
    10000.00,
    10000.00,
    true,
    'demo_tenant'
FROM tenant_demo_tenant.users u 
WHERE u.email = 'demo@renx.com'
ON CONFLICT (id) DO NOTHING; 