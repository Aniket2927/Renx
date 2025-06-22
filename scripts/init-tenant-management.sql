-- RenX Multi-Tenant Database Initialization Script
-- This script sets up the tenant management infrastructure

-- Create tenant management schema
CREATE SCHEMA IF NOT EXISTS tenant_management;

-- Create tenants table in the main database
CREATE TABLE IF NOT EXISTS tenant_management.tenants (
    tenant_id VARCHAR(255) PRIMARY KEY,
    tenant_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    subscription_plan VARCHAR(100) NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'inactive')),
    CONSTRAINT valid_subscription_plan CHECK (subscription_plan IN ('basic', 'professional', 'enterprise'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenant_management.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_plan ON tenant_management.tenants(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenant_management.tenants(created_at);

-- Create tenant configuration table
CREATE TABLE IF NOT EXISTS tenant_management.tenant_configurations (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    config_key VARCHAR(255) NOT NULL,
    config_value JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraint
    FOREIGN KEY (tenant_id) REFERENCES tenant_management.tenants(tenant_id) ON DELETE CASCADE,
    
    -- Unique constraint for tenant + config_key
    UNIQUE(tenant_id, config_key)
);

-- Create index for tenant configurations
CREATE INDEX IF NOT EXISTS idx_tenant_configurations_tenant_id ON tenant_management.tenant_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_configurations_key ON tenant_management.tenant_configurations(config_key);

-- Create tenant metrics table for tracking usage
CREATE TABLE IF NOT EXISTS tenant_management.tenant_metrics (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraint
    FOREIGN KEY (tenant_id) REFERENCES tenant_management.tenants(tenant_id) ON DELETE CASCADE,
    
    -- Unique constraint for tenant + metric + date
    UNIQUE(tenant_id, metric_name, metric_date)
);

-- Create indexes for tenant metrics
CREATE INDEX IF NOT EXISTS idx_tenant_metrics_tenant_id ON tenant_management.tenant_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_metrics_date ON tenant_management.tenant_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_tenant_metrics_name ON tenant_management.tenant_metrics(metric_name);

-- Create global audit log table
CREATE TABLE IF NOT EXISTS tenant_management.global_audit_logs (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255),
    user_id INTEGER,
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraint (nullable for system actions)
    FOREIGN KEY (tenant_id) REFERENCES tenant_management.tenants(tenant_id) ON DELETE SET NULL
);

-- Create indexes for global audit logs
CREATE INDEX IF NOT EXISTS idx_global_audit_logs_tenant_id ON tenant_management.global_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_global_audit_logs_timestamp ON tenant_management.global_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_global_audit_logs_action ON tenant_management.global_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_global_audit_logs_resource ON tenant_management.global_audit_logs(resource);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION tenant_management.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenant_management.tenants 
    FOR EACH ROW EXECUTE FUNCTION tenant_management.update_updated_at_column();

CREATE TRIGGER update_tenant_configurations_updated_at 
    BEFORE UPDATE ON tenant_management.tenant_configurations 
    FOR EACH ROW EXECUTE FUNCTION tenant_management.update_updated_at_column();

-- Insert default subscription plans data
INSERT INTO tenant_management.tenants (tenant_id, tenant_name, status, subscription_plan, settings) VALUES
('demo_tenant', 'Demo Tenant', 'active', 'professional', '{"tradingEnabled": true, "maxUsers": 10, "features": ["real-time-data", "ai-signals"]}')
ON CONFLICT (tenant_id) DO NOTHING;

-- Create function to provision new tenant schema
CREATE OR REPLACE FUNCTION tenant_management.provision_tenant_schema(p_tenant_id VARCHAR(255))
RETURNS BOOLEAN AS $$
DECLARE
    schema_name VARCHAR(255);
BEGIN
    -- Generate schema name
    schema_name := 'tenant_' || REPLACE(p_tenant_id, '-', '_');
    
    -- Create schema
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
    
    -- Create users table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            role VARCHAR(50) NOT NULL DEFAULT ''user'',
            status VARCHAR(50) NOT NULL DEFAULT ''active'',
            tenant_id VARCHAR(255) NOT NULL,
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            
            CONSTRAINT valid_role CHECK (role IN (''super_admin'', ''admin'', ''user'')),
            CONSTRAINT valid_status CHECK (status IN (''active'', ''inactive'', ''suspended''))
        )', schema_name);
    
    -- Create permissions table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.permissions (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            resource VARCHAR(255) NOT NULL,
            action VARCHAR(255) NOT NULL,
            description TEXT
        )', schema_name);
    
    -- Create role_permissions table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.role_permissions (
            role VARCHAR(50) NOT NULL,
            permission_id VARCHAR(255) NOT NULL,
            PRIMARY KEY (role, permission_id),
            FOREIGN KEY (permission_id) REFERENCES %I.permissions(id)
        )', schema_name, schema_name);
    
    -- Create user_permissions table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.user_permissions (
            user_id INTEGER NOT NULL,
            permission_id VARCHAR(255) NOT NULL,
            tenant_id VARCHAR(255) NOT NULL,
            assigned_by INTEGER,
            assigned_at TIMESTAMP DEFAULT NOW(),
            PRIMARY KEY (user_id, permission_id, tenant_id),
            FOREIGN KEY (user_id) REFERENCES %I.users(id),
            FOREIGN KEY (permission_id) REFERENCES %I.permissions(id)
        )', schema_name, schema_name, schema_name);
    
    -- Create portfolios table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.portfolios (
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
            FOREIGN KEY (user_id) REFERENCES %I.users(id)
        )', schema_name, schema_name);
    
    -- Create positions table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.positions (
            id VARCHAR(255) PRIMARY KEY,
            portfolio_id VARCHAR(255) NOT NULL,
            symbol VARCHAR(50) NOT NULL,
            quantity DECIMAL(15,4) NOT NULL,
            average_cost DECIMAL(15,4) NOT NULL,
            current_price DECIMAL(15,4) DEFAULT 0,
            market_value DECIMAL(15,2) DEFAULT 0,
            unrealized_pnl DECIMAL(15,2) DEFAULT 0,
            asset_type VARCHAR(50) DEFAULT ''stock'',
            tenant_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY (portfolio_id) REFERENCES %I.portfolios(id)
        )', schema_name, schema_name);
    
    -- Create orders table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.orders (
            id VARCHAR(255) PRIMARY KEY,
            portfolio_id VARCHAR(255) NOT NULL,
            symbol VARCHAR(50) NOT NULL,
            side VARCHAR(10) NOT NULL,
            order_type VARCHAR(20) NOT NULL,
            quantity DECIMAL(15,4) NOT NULL,
            price DECIMAL(15,4),
            stop_price DECIMAL(15,4),
            status VARCHAR(20) DEFAULT ''pending'',
            filled_quantity DECIMAL(15,4) DEFAULT 0,
            filled_price DECIMAL(15,4),
            time_in_force VARCHAR(10) DEFAULT ''day'',
            tenant_id VARCHAR(255) NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            filled_at TIMESTAMP,
            FOREIGN KEY (portfolio_id) REFERENCES %I.portfolios(id),
            FOREIGN KEY (user_id) REFERENCES %I.users(id)
        )', schema_name, schema_name, schema_name);
    
    -- Create audit_logs table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.audit_logs (
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
            FOREIGN KEY (user_id) REFERENCES %I.users(id)
        )', schema_name, schema_name);
    
    -- Create indexes
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_users_email ON %I.users(email)', REPLACE(schema_name, '-', '_'), schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_users_tenant_id ON %I.users(tenant_id)', REPLACE(schema_name, '-', '_'), schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_portfolios_user_id ON %I.portfolios(user_id)', REPLACE(schema_name, '-', '_'), schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_positions_portfolio_id ON %I.positions(portfolio_id)', REPLACE(schema_name, '-', '_'), schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_orders_portfolio_id ON %I.orders(portfolio_id)', REPLACE(schema_name, '-', '_'), schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_audit_logs_user_id ON %I.audit_logs(user_id)', REPLACE(schema_name, '-', '_'), schema_name);
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error provisioning tenant schema: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to insert default permissions for a tenant
CREATE OR REPLACE FUNCTION tenant_management.insert_default_permissions(p_tenant_id VARCHAR(255))
RETURNS BOOLEAN AS $$
DECLARE
    schema_name VARCHAR(255);
    permission_record RECORD;
    role_permission_record RECORD;
BEGIN
    schema_name := 'tenant_' || REPLACE(p_tenant_id, '-', '_');
    
    -- Define default permissions
    FOR permission_record IN
        SELECT * FROM (VALUES
            ('trade:create', 'Create Trade', 'trades', 'create'),
            ('trade:read', 'Read Trades', 'trades', 'read'),
            ('trade:update', 'Update Trade', 'trades', 'update'),
            ('trade:delete', 'Delete Trade', 'trades', 'delete'),
            ('portfolio:create', 'Create Portfolio', 'portfolios', 'create'),
            ('portfolio:read', 'Read Portfolio', 'portfolios', 'read'),
            ('portfolio:update', 'Update Portfolio', 'portfolios', 'update'),
            ('portfolio:delete', 'Delete Portfolio', 'portfolios', 'delete'),
            ('user:create', 'Create User', 'users', 'create'),
            ('user:read', 'Read Users', 'users', 'read'),
            ('user:update', 'Update User', 'users', 'update'),
            ('user:delete', 'Delete User', 'users', 'delete')
        ) AS t(id, name, resource, action)
    LOOP
        EXECUTE format('
            INSERT INTO %I.permissions (id, name, resource, action, description)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO NOTHING
        ', schema_name) USING permission_record.id, permission_record.name, permission_record.resource, permission_record.action, 
        'Permission to ' || permission_record.action || ' ' || permission_record.resource;
    END LOOP;
    
    -- Assign permissions to roles
    FOR role_permission_record IN
        SELECT * FROM (VALUES
            ('admin', 'trade:create'), ('admin', 'trade:read'), ('admin', 'trade:update'), ('admin', 'trade:delete'),
            ('admin', 'portfolio:create'), ('admin', 'portfolio:read'), ('admin', 'portfolio:update'), ('admin', 'portfolio:delete'),
            ('admin', 'user:create'), ('admin', 'user:read'), ('admin', 'user:update'), ('admin', 'user:delete'),
            ('user', 'trade:create'), ('user', 'trade:read'),
            ('user', 'portfolio:read'), ('user', 'portfolio:update')
        ) AS t(role, permission_id)
    LOOP
        EXECUTE format('
            INSERT INTO %I.role_permissions (role, permission_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
        ', schema_name) USING role_permission_record.role, role_permission_record.permission_id;
    END LOOP;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting default permissions: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA tenant_management TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA tenant_management TO PUBLIC;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA tenant_management TO PUBLIC;

-- Log initialization
INSERT INTO tenant_management.global_audit_logs (action, resource, details, timestamp)
VALUES ('schema_initialization', 'tenant_management', '{"message": "Tenant management schema initialized successfully"}', NOW());

COMMIT; 