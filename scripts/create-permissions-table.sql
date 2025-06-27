-- Create permissions table for tenant schema
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    permission_name VARCHAR(100) NOT NULL,
    permission_value VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_permissions_user_id ON permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(permission_name);

-- Insert default permissions for existing users
INSERT INTO permissions (user_id, permission_name, permission_value) 
SELECT DISTINCT id, 'trading.orders.create', 'true' FROM users
ON CONFLICT DO NOTHING;

INSERT INTO permissions (user_id, permission_name, permission_value) 
SELECT DISTINCT id, 'trading.orders.view', 'true' FROM users
ON CONFLICT DO NOTHING;

INSERT INTO permissions (user_id, permission_name, permission_value) 
SELECT DISTINCT id, 'trading.orders.cancel', 'true' FROM users
ON CONFLICT DO NOTHING;

INSERT INTO permissions (user_id, permission_name, permission_value) 
SELECT DISTINCT id, 'portfolio.view', 'true' FROM users
ON CONFLICT DO NOTHING;

INSERT INTO permissions (user_id, permission_name, permission_value) 
SELECT DISTINCT id, 'portfolio.manage', 'true' FROM users
ON CONFLICT DO NOTHING; 