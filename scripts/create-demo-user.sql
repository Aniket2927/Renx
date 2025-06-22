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

-- Insert basic permissions for the demo tenant
INSERT INTO tenant_demo_tenant.permissions (id, name, resource, action, description) VALUES
('portfolio.read', 'Read Portfolios', 'portfolio', 'read', 'View portfolio information'),
('portfolio.write', 'Write Portfolios', 'portfolio', 'write', 'Create and modify portfolios'),
('trading.read', 'Read Trading', 'trading', 'read', 'View trading information'),
('trading.write', 'Write Trading', 'trading', 'write', 'Execute trades'),
('ai.read', 'Read AI Signals', 'ai', 'read', 'View AI analysis and signals'),
('ai.write', 'Use AI Features', 'ai', 'write', 'Generate AI analysis')
ON CONFLICT (id) DO NOTHING;

-- Assign permissions to user role
INSERT INTO tenant_demo_tenant.role_permissions (role, permission_id) VALUES
('user', 'portfolio.read'),
('user', 'portfolio.write'),
('user', 'trading.read'),
('user', 'trading.write'),
('user', 'ai.read'),
('user', 'ai.write')
ON CONFLICT (role, permission_id) DO NOTHING;

-- Create a default portfolio for the demo user
INSERT INTO tenant_demo_tenant.portfolios (
    id,
    name,
    user_id,
    total_value,
    available_cash,
    is_default,
    tenant_id
) VALUES (
    'demo_portfolio_1',
    'Demo Portfolio',
    (SELECT id FROM tenant_demo_tenant.users WHERE email = 'demo@renx.com'),
    50000.00,
    50000.00,
    true,
    'demo_tenant'
) ON CONFLICT (id) DO NOTHING; 