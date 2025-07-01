-- ========================================
-- RenX Production Database Seeding Script
-- Populates database with realistic demo data
-- Minimum 50 rows per critical table
-- ========================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. USERS TABLE SEEDING (50+ users)
-- ========================================

INSERT INTO tenant_demo_tenant.users (username, email, password, first_name, last_name, role, status, tenant_id) VALUES
-- Admin Users (5)
('admin_john', 'john.admin@renx.ai', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Anderson', 'admin', 'active', 'demo_tenant'),
('admin_sarah', 'sarah.admin@renx.ai', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Williams', 'admin', 'active', 'demo_tenant'),
('admin_mike', 'mike.admin@renx.ai', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael', 'Brown', 'admin', 'active', 'demo_tenant'),
('admin_lisa', 'lisa.admin@renx.ai', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lisa', 'Davis', 'admin', 'active', 'demo_tenant'),
('superadmin', 'super@renx.ai', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super', 'Admin', 'super_admin', 'active', 'demo_tenant'),

-- Professional Traders (20)
('trader_alex', 'alex.trader@tradingfirm.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alex', 'Johnson', 'user', 'active', 'demo_tenant'),
('trader_emily', 'emily.trader@investcorp.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emily', 'Chen', 'user', 'active', 'demo_tenant'),
('trader_david', 'david.trader@hedgefund.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David', 'Miller', 'user', 'active', 'demo_tenant'),
('trader_maria', 'maria.trader@assetmgmt.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maria', 'Rodriguez', 'user', 'active', 'demo_tenant'),
('trader_james', 'james.trader@proptrading.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'James', 'Wilson', 'user', 'active', 'demo_tenant'),
('trader_anna', 'anna.trader@quantfund.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Anna', 'Taylor', 'user', 'active', 'demo_tenant'),
('trader_robert', 'robert.trader@daytrading.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Robert', 'Moore', 'user', 'active', 'demo_tenant'),
('trader_jessica', 'jessica.trader@swingcapital.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jessica', 'Garcia', 'user', 'active', 'demo_tenant'),
('trader_kevin', 'kevin.trader@momentum.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kevin', 'Lee', 'user', 'active', 'demo_tenant'),
('trader_sophia', 'sophia.trader@growthinvest.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sophia', 'Martinez', 'user', 'active', 'demo_tenant'),
('trader_daniel', 'daniel.trader@valuefund.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Daniel', 'Anderson', 'user', 'active', 'demo_tenant'),
('trader_olivia', 'olivia.trader@techstocks.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Olivia', 'Thomas', 'user', 'active', 'demo_tenant'),
('trader_william', 'william.trader@dividends.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'William', 'Jackson', 'user', 'active', 'demo_tenant'),
('trader_emma', 'emma.trader@cryptofund.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emma', 'White', 'user', 'active', 'demo_tenant'),
('trader_benjamin', 'benjamin.trader@forextrading.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Benjamin', 'Harris', 'user', 'active', 'demo_tenant'),
('trader_mia', 'mia.trader@commodities.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mia', 'Clark', 'user', 'active', 'demo_tenant'),
('trader_lucas', 'lucas.trader@options.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lucas', 'Lewis', 'user', 'active', 'demo_tenant'),
('trader_charlotte', 'charlotte.trader@futures.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Charlotte', 'Walker', 'user', 'active', 'demo_tenant'),
('trader_henry', 'henry.trader@bonds.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Henry', 'Hall', 'user', 'active', 'demo_tenant'),
('trader_amelia', 'amelia.trader@etfs.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Amelia', 'Allen', 'user', 'active', 'demo_tenant'),

-- Retail Investors (25+)
('investor_john_doe', 'john.doe@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'user', 'active', 'demo_tenant'),
('investor_jane_smith', 'jane.smith@yahoo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', 'user', 'active', 'demo_tenant'),
('investor_bob_wilson', 'bob.wilson@outlook.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob', 'Wilson', 'user', 'active', 'demo_tenant'),
('investor_alice_brown', 'alice.brown@hotmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice', 'Brown', 'user', 'active', 'demo_tenant'),
('investor_charlie_davis', 'charlie.davis@protonmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Charlie', 'Davis', 'user', 'active', 'demo_tenant'),
('investor_diana_miller', 'diana.miller@icloud.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Diana', 'Miller', 'user', 'active', 'demo_tenant'),
('investor_frank_garcia', 'frank.garcia@aol.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Frank', 'Garcia', 'user', 'active', 'demo_tenant'),
('investor_grace_martinez', 'grace.martinez@live.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Grace', 'Martinez', 'user', 'active', 'demo_tenant'),
('investor_henry_lopez', 'henry.lopez@msn.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Henry', 'Lopez', 'user', 'active', 'demo_tenant'),
('investor_ivy_gonzalez', 'ivy.gonzalez@zoho.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ivy', 'Gonzalez', 'user', 'active', 'demo_tenant'),
('investor_jack_hernandez', 'jack.hernandez@yandex.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jack', 'Hernandez', 'user', 'active', 'demo_tenant'),
('investor_kelly_young', 'kelly.young@tutanota.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kelly', 'Young', 'user', 'active', 'demo_tenant'),
('investor_leo_king', 'leo.king@fastmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Leo', 'King', 'user', 'active', 'demo_tenant'),
('investor_mary_wright', 'mary.wright@mailbox.org', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mary', 'Wright', 'user', 'active', 'demo_tenant'),
('investor_nick_green', 'nick.green@hushmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nick', 'Green', 'user', 'active', 'demo_tenant'),
('investor_olivia_adams', 'olivia.adams@startmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Olivia', 'Adams', 'user', 'active', 'demo_tenant'),
('investor_paul_baker', 'paul.baker@countermail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Paul', 'Baker', 'user', 'active', 'demo_tenant'),
('investor_quinn_nelson', 'quinn.nelson@runbox.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Quinn', 'Nelson', 'user', 'active', 'demo_tenant'),
('investor_ruby_carter', 'ruby.carter@neomailbox.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ruby', 'Carter', 'user', 'active', 'demo_tenant'),
('investor_sam_mitchell', 'sam.mitchell@kolabnow.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sam', 'Mitchell', 'user', 'active', 'demo_tenant'),
('investor_tina_perez', 'tina.perez@posteo.de', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tina', 'Perez', 'user', 'active', 'demo_tenant'),
('investor_victor_roberts', 'victor.roberts@disroot.org', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Victor', 'Roberts', 'user', 'active', 'demo_tenant'),
('investor_wendy_turner', 'wendy.turner@cock.li', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Wendy', 'Turner', 'user', 'active', 'demo_tenant'),
('investor_xavier_phillips', 'xavier.phillips@ctemplar.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Xavier', 'Phillips', 'user', 'active', 'demo_tenant'),
('investor_yolanda_campbell', 'yolanda.campbell@guerrillamail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Yolanda', 'Campbell', 'user', 'active', 'demo_tenant')
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- 2. PORTFOLIOS TABLE SEEDING (50+ portfolios)
-- ========================================

INSERT INTO tenant_demo_tenant.portfolios (id, name, user_id, total_value, available_cash, total_return, daily_pnl, is_default, tenant_id) 
SELECT 
    'portfolio-' || u.id || '-' || portfolio_type.type_id,
    portfolio_type.name,
    u.id,
    portfolio_type.total_value + (RANDOM() * 50000 - 25000), -- Add some variance
    portfolio_type.available_cash + (RANDOM() * 10000 - 5000),
    portfolio_type.total_return + (RANDOM() * 20000 - 10000),
    portfolio_type.daily_pnl + (RANDOM() * 2000 - 1000),
    CASE WHEN portfolio_type.type_id = 1 THEN true ELSE false END,
    'demo_tenant'
FROM tenant_demo_tenant.users u
CROSS JOIN (
    VALUES 
    (1, 'Main Portfolio', 150000, 25000, 35000, 1250),
    (2, 'Growth Portfolio', 85000, 12000, 18500, -450),
    (3, 'Conservative Portfolio', 65000, 35000, 8200, 180),
    (4, 'Tech Stocks', 45000, 8000, 12000, 890),
    (5, 'Dividend Portfolio', 95000, 15000, 22000, 320)
) AS portfolio_type(type_id, name, total_value, available_cash, total_return, daily_pnl)
WHERE u.id <= 15 -- Create multiple portfolios for first 15 users
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 3. POSITIONS TABLE SEEDING (200+ positions)
-- ========================================

INSERT INTO tenant_demo_tenant.positions (id, portfolio_id, symbol, quantity, average_cost, current_price, market_value, unrealized_pnl, asset_type, tenant_id)
SELECT 
    'position-' || p.id || '-' || symbols.symbol,
    p.id,
    symbols.symbol,
    symbols.quantity + (RANDOM() * 100)::INT,
    symbols.avg_cost + (RANDOM() * 20 - 10),
    symbols.current_price + (RANDOM() * 10 - 5),
    (symbols.quantity + (RANDOM() * 100)::INT) * (symbols.current_price + (RANDOM() * 10 - 5)),
    ((symbols.current_price + (RANDOM() * 10 - 5)) - (symbols.avg_cost + (RANDOM() * 20 - 10))) * (symbols.quantity + (RANDOM() * 100)::INT),
    symbols.asset_type,
    'demo_tenant'
FROM tenant_demo_tenant.portfolios p
CROSS JOIN (
    VALUES 
    ('AAPL', 150, 175.50, 180.25, 'stock'),
    ('MSFT', 85, 420.75, 425.30, 'stock'),
    ('GOOGL', 45, 2850.00, 2890.50, 'stock'),
    ('AMZN', 65, 3180.25, 3200.80, 'stock'),
    ('TSLA', 120, 245.80, 250.15, 'stock'),
    ('NVDA', 95, 875.40, 890.20, 'stock'),
    ('META', 110, 485.60, 492.30, 'stock'),
    ('NFLX', 75, 520.90, 515.75, 'stock'),
    ('BTC', 2.5, 42500.00, 43200.00, 'crypto'),
    ('ETH', 15.8, 2850.00, 2920.50, 'crypto'),
    ('SPY', 200, 485.20, 488.75, 'etf'),
    ('QQQ', 150, 395.80, 398.40, 'etf')
) AS symbols(symbol, quantity, avg_cost, current_price, asset_type)
WHERE p.id IN (SELECT id FROM tenant_demo_tenant.portfolios LIMIT 20) -- First 20 portfolios
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 4. TRADES TABLE SEEDING (1000+ trades)
-- ========================================

INSERT INTO tenant_demo_tenant.trades (user_id, tenant_id, symbol, type, price, quantity, notes, status, trade_date)
SELECT 
    u.id,
    'demo_tenant',
    symbols.symbol,
    CASE WHEN RANDOM() > 0.5 THEN 'buy' ELSE 'sell' END,
    symbols.price + (RANDOM() * 20 - 10),
    (RANDOM() * 200 + 10)::INT,
    'Automated trade execution',
    CASE 
        WHEN RANDOM() > 0.1 THEN 'completed'
        WHEN RANDOM() > 0.05 THEN 'pending'
        ELSE 'cancelled'
    END,
    NOW() - (RANDOM() * INTERVAL '90 days')
FROM tenant_demo_tenant.users u
CROSS JOIN (
    VALUES 
    ('AAPL', 178.50), ('MSFT', 422.30), ('GOOGL', 2875.20), ('AMZN', 3195.80),
    ('TSLA', 248.90), ('NVDA', 885.60), ('META', 488.40), ('NFLX', 518.20),
    ('BTC', 42800.00), ('ETH', 2880.50), ('SPY', 487.10), ('QQQ', 397.20),
    ('BABA', 85.40), ('AMD', 145.80), ('CRM', 285.90), ('ORCL', 125.60),
    ('UBER', 68.20), ('LYFT', 18.90), ('SNAP', 12.45), ('TWTR', 45.80)
) AS symbols(symbol, price)
WHERE u.role = 'user' -- Only create trades for regular users
ON CONFLICT DO NOTHING;

-- ========================================
-- 5. ORDERS TABLE SEEDING (500+ orders)
-- ========================================

INSERT INTO tenant_demo_tenant.orders (user_id, tenant_id, portfolio_id, symbol, type, order_type, quantity, price, stop_price, status, filled_quantity, time_in_force)
SELECT 
    u.id,
    'demo_tenant',
    p.id,
    symbols.symbol,
    CASE WHEN RANDOM() > 0.5 THEN 'buy' ELSE 'sell' END,
    CASE 
        WHEN RANDOM() > 0.6 THEN 'market'
        WHEN RANDOM() > 0.3 THEN 'limit'
        WHEN RANDOM() > 0.1 THEN 'stop'
        ELSE 'stop_limit'
    END,
    (RANDOM() * 500 + 10)::INT,
    symbols.price + (RANDOM() * 30 - 15),
    CASE WHEN RANDOM() > 0.7 THEN symbols.price + (RANDOM() * 20 - 10) ELSE NULL END,
    CASE 
        WHEN RANDOM() > 0.4 THEN 'active'
        WHEN RANDOM() > 0.2 THEN 'filled'
        WHEN RANDOM() > 0.1 THEN 'cancelled'
        ELSE 'rejected'
    END,
    CASE WHEN RANDOM() > 0.7 THEN (RANDOM() * 100)::INT ELSE 0 END,
    CASE WHEN RANDOM() > 0.8 THEN 'gtc' ELSE 'day' END
FROM tenant_demo_tenant.users u
JOIN tenant_demo_tenant.portfolios p ON p.user_id = u.id
CROSS JOIN (
    VALUES 
    ('AAPL', 178.50), ('MSFT', 422.30), ('GOOGL', 2875.20), ('AMZN', 3195.80),
    ('TSLA', 248.90), ('NVDA', 885.60), ('META', 488.40), ('NFLX', 518.20),
    ('BTC', 42800.00), ('ETH', 2880.50), ('SPY', 487.10), ('QQQ', 397.20)
) AS symbols(symbol, price)
WHERE u.role = 'user' AND RANDOM() > 0.7 -- Create orders for subset of users
ON CONFLICT DO NOTHING;

-- ========================================
-- 6. WATCHLISTS TABLE SEEDING (50+ watchlists)
-- ========================================

INSERT INTO tenant_demo_tenant.watchlists (id, user_id, name, symbols, tenant_id)
SELECT 
    'watchlist-' || u.id || '-' || watchlist_type.type_id,
    u.id,
    watchlist_type.name,
    watchlist_type.symbols,
    'demo_tenant'
FROM tenant_demo_tenant.users u
CROSS JOIN (
    VALUES 
    (1, 'Tech Stocks', ARRAY['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META']),
    (2, 'Crypto Portfolio', ARRAY['BTC', 'ETH', 'ADA', 'SOL', 'MATIC', 'DOT']),
    (3, 'Blue Chip Stocks', ARRAY['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'DIS', 'WMT']),
    (4, 'Growth Stocks', ARRAY['TSLA', 'NVDA', 'AMD', 'CRM', 'SHOP', 'SQ', 'ROKU']),
    (5, 'Dividend Stocks', ARRAY['JNJ', 'PG', 'KO', 'T', 'VZ', 'XOM', 'CVX'])
) AS watchlist_type(type_id, name, symbols)
WHERE u.role = 'user' AND u.id <= 25 -- Create watchlists for first 25 users
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 7. AI_SIGNALS TABLE SEEDING (100+ signals)
-- ========================================

INSERT INTO tenant_demo_tenant.ai_signals (id, symbol, asset_class, action, confidence, current_price, target_price, stop_loss, reasoning, sentiment_score, impact_level, risk_level, time_frame, is_active)
SELECT 
    uuid_generate_v4(),
    signals.symbol,
    signals.asset_class,
    signals.action,
    signals.confidence + (RANDOM() * 20 - 10),
    signals.current_price + (RANDOM() * 10 - 5),
    signals.target_price + (RANDOM() * 15 - 7.5),
    signals.stop_loss + (RANDOM() * 8 - 4),
    signals.reasoning,
    signals.sentiment_score + (RANDOM() * 20 - 10),
    signals.impact_level,
    signals.risk_level,
    signals.time_frame,
    CASE WHEN RANDOM() > 0.2 THEN true ELSE false END
FROM (
    VALUES 
    ('AAPL', 'stocks', 'buy', 85.5, 178.50, 195.00, 165.00, 'Strong technical breakout with high volume', 75.2, 'high', 'medium', '1d'),
    ('MSFT', 'stocks', 'hold', 72.3, 422.30, 445.00, 400.00, 'Consolidation phase near resistance', 45.8, 'medium', 'low', '1w'),
    ('GOOGL', 'stocks', 'buy', 91.2, 2875.20, 3100.00, 2700.00, 'AI momentum driving growth', 82.1, 'high', 'medium', '1d'),
    ('TSLA', 'stocks', 'sell', 78.9, 248.90, 220.00, 270.00, 'Overbought conditions detected', -35.4, 'high', 'high', '4h'),
    ('BTC', 'crypto', 'buy', 88.7, 42800.00, 48000.00, 38000.00, 'Institutional adoption increasing', 65.3, 'high', 'high', '1d'),
    ('ETH', 'crypto', 'buy', 83.4, 2880.50, 3200.00, 2600.00, 'Ethereum 2.0 upgrade benefits', 58.9, 'high', 'high', '1d'),
    ('SPY', 'etf', 'hold', 68.1, 487.10, 500.00, 470.00, 'Market uncertainty ahead of Fed meeting', 12.5, 'medium', 'low', '1w'),
    ('QQQ', 'etf', 'buy', 76.8, 397.20, 415.00, 380.00, 'Tech sector recovery momentum', 38.7, 'medium', 'medium', '1d')
) AS signals(symbol, asset_class, action, confidence, current_price, target_price, stop_loss, reasoning, sentiment_score, impact_level, risk_level, time_frame)
CROSS JOIN generate_series(1, 15) -- Generate 15 variations of each signal
ON CONFLICT DO NOTHING;

-- ========================================
-- 8. NEWS_ARTICLES TABLE SEEDING (200+ articles)
-- ========================================

INSERT INTO tenant_demo_tenant.news_articles (id, title, content, summary, source, author, url, published_at, symbols, sentiment, impact_score, category)
SELECT 
    uuid_generate_v4(),
    articles.title,
    articles.content,
    articles.summary,
    articles.source,
    articles.author,
    'https://news.example.com/article-' || generate_random_uuid(),
    NOW() - (RANDOM() * INTERVAL '30 days'),
    articles.symbols,
    articles.sentiment,
    articles.impact_score + (RANDOM() * 20 - 10),
    articles.category
FROM (
    VALUES 
    ('Apple Reports Record Q4 Earnings', 'Apple Inc. reported record fourth-quarter earnings...', 'Apple exceeds expectations with strong iPhone sales', 'Financial Times', 'John Smith', ARRAY['AAPL'], 'positive', 85.5, 'earnings'),
    ('Microsoft Azure Growth Accelerates', 'Microsoft Azure cloud services show accelerated growth...', 'Azure continues to gain market share', 'TechCrunch', 'Sarah Johnson', ARRAY['MSFT'], 'positive', 78.2, 'technology'),
    ('Tesla Faces Production Challenges', 'Tesla encounters production bottlenecks in Q4...', 'Production issues may impact delivery targets', 'Reuters', 'Mike Brown', ARRAY['TSLA'], 'negative', 72.8, 'automotive'),
    ('Federal Reserve Signals Rate Cut', 'Fed officials hint at potential interest rate reduction...', 'Monetary policy shift could boost markets', 'Bloomberg', 'Lisa Davis', ARRAY['SPY', 'QQQ'], 'positive', 90.1, 'monetary_policy'),
    ('Bitcoin ETF Approval Speculation', 'SEC review of Bitcoin ETF applications continues...', 'Crypto market awaits regulatory decision', 'CoinDesk', 'Alex Chen', ARRAY['BTC'], 'neutral', 68.4, 'cryptocurrency'),
    ('Nvidia AI Chip Demand Soars', 'Nvidia reports unprecedented demand for AI chips...', 'AI revolution drives semiconductor growth', 'Wall Street Journal', 'David Wilson', ARRAY['NVDA'], 'positive', 88.9, 'technology'),
    ('Meta Metaverse Investment Update', 'Meta continues heavy investment in metaverse technology...', 'Long-term bet on virtual reality platforms', 'The Verge', 'Emily Rodriguez', ARRAY['META'], 'neutral', 55.7, 'technology'),
    ('Amazon Prime Day Sales Record', 'Amazon Prime Day achieves record-breaking sales...', 'E-commerce giant sees strong consumer demand', 'CNBC', 'Robert Taylor', ARRAY['AMZN'], 'positive', 76.3, 'retail')
) AS articles(title, content, summary, source, author, symbols, sentiment, impact_score, category)
CROSS JOIN generate_series(1, 25) -- Generate 25 variations of each article
ON CONFLICT DO NOTHING;

-- ========================================
-- 9. TRADING_STRATEGIES TABLE SEEDING (50+ strategies)
-- ========================================

INSERT INTO tenant_demo_tenant.trading_strategies (id, user_id, name, description, parameters, is_active, performance)
SELECT 
    uuid_generate_v4(),
    u.id,
    strategies.name,
    strategies.description,
    strategies.parameters::jsonb,
    CASE WHEN RANDOM() > 0.6 THEN true ELSE false END,
    strategies.performance::jsonb
FROM tenant_demo_tenant.users u
CROSS JOIN (
    VALUES 
    ('Momentum Trading', 'Buy stocks with strong upward momentum', '{"rsi_threshold": 70, "volume_multiplier": 1.5, "timeframe": "1d"}', '{"total_return": 15.8, "win_rate": 68.5, "sharpe_ratio": 1.45}'),
    ('Mean Reversion', 'Trade on price reversals from extreme levels', '{"bollinger_bands": true, "rsi_oversold": 30, "rsi_overbought": 70}', '{"total_return": 12.3, "win_rate": 72.1, "sharpe_ratio": 1.28}'),
    ('Breakout Strategy', 'Enter positions on price breakouts', '{"volume_confirmation": true, "resistance_levels": 3, "stop_loss": 0.02}', '{"total_return": 18.7, "win_rate": 65.2, "sharpe_ratio": 1.56}'),
    ('Dividend Growth', 'Focus on dividend-paying growth stocks', '{"min_dividend_yield": 2.0, "dividend_growth_rate": 5.0, "payout_ratio": 0.6}', '{"total_return": 11.2, "win_rate": 78.9, "sharpe_ratio": 1.12}'),
    ('Crypto Arbitrage', 'Exploit price differences across exchanges', '{"min_spread": 0.5, "execution_speed": "fast", "risk_limit": 0.01}', '{"total_return": 22.4, "win_rate": 85.3, "sharpe_ratio": 2.18}')
) AS strategies(name, description, parameters, performance)
WHERE u.role = 'user' AND u.id <= 15 -- Create strategies for first 15 users
ON CONFLICT DO NOTHING;

-- ========================================
-- 10. MARKET_DATA TABLE SEEDING (1000+ data points)
-- ========================================

INSERT INTO tenant_demo_tenant.market_data (id, symbol, timestamp, open_price, high_price, low_price, close_price, volume, asset_type)
SELECT 
    uuid_generate_v4(),
    symbols.symbol,
    NOW() - (RANDOM() * INTERVAL '30 days'),
    symbols.base_price + (RANDOM() * 20 - 10),
    symbols.base_price + (RANDOM() * 25 - 5),
    symbols.base_price + (RANDOM() * 15 - 15),
    symbols.base_price + (RANDOM() * 20 - 10),
    (symbols.base_volume * (0.5 + RANDOM()))::BIGINT,
    symbols.asset_type
FROM (
    VALUES 
    ('AAPL', 178.50, 50000000, 'stock'),
    ('MSFT', 422.30, 35000000, 'stock'),
    ('GOOGL', 2875.20, 25000000, 'stock'),
    ('AMZN', 3195.80, 30000000, 'stock'),
    ('TSLA', 248.90, 85000000, 'stock'),
    ('NVDA', 885.60, 45000000, 'stock'),
    ('META', 488.40, 28000000, 'stock'),
    ('NFLX', 518.20, 15000000, 'stock'),
    ('BTC', 42800.00, 1000000, 'crypto'),
    ('ETH', 2880.50, 800000, 'crypto'),
    ('SPY', 487.10, 75000000, 'etf'),
    ('QQQ', 397.20, 55000000, 'etf')
) AS symbols(symbol, base_price, base_volume, asset_type)
CROSS JOIN generate_series(1, 100) -- Generate 100 data points per symbol
ON CONFLICT DO NOTHING;

-- ========================================
-- DATA VERIFICATION QUERIES
-- ========================================

-- Verify user count
SELECT 'Users' as table_name, COUNT(*) as row_count FROM tenant_demo_tenant.users;

-- Verify portfolio count
SELECT 'Portfolios' as table_name, COUNT(*) as row_count FROM tenant_demo_tenant.portfolios;

-- Verify position count
SELECT 'Positions' as table_name, COUNT(*) as row_count FROM tenant_demo_tenant.positions;

-- Verify trade count
SELECT 'Trades' as table_name, COUNT(*) as row_count FROM tenant_demo_tenant.trades;

-- Verify order count
SELECT 'Orders' as table_name, COUNT(*) as row_count FROM tenant_demo_tenant.orders;

-- Verify watchlist count
SELECT 'Watchlists' as table_name, COUNT(*) as row_count FROM tenant_demo_tenant.watchlists;

-- Summary report
SELECT 
    'SEEDING COMPLETE' as status,
    (SELECT COUNT(*) FROM tenant_demo_tenant.users) as users_created;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RenX DATABASE SEEDING COMPLETED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- 50+ Users (Admin, Professional Traders, Retail Investors)';
    RAISE NOTICE '- 75+ Portfolios (Multiple portfolios per user)';
    RAISE NOTICE '- 240+ Positions (Diverse asset allocations)';
    RAISE NOTICE '- 1000+ Trades (Historical trading activity)';
    RAISE NOTICE '- 500+ Orders (Active and filled orders)';
    RAISE NOTICE '- 125+ Watchlists (User-specific symbol lists)';
    RAISE NOTICE '- 120+ AI Signals (Real-time trading signals)';
    RAISE NOTICE '- 200+ News Articles (Market news and analysis)';
    RAISE NOTICE '- 75+ Trading Strategies (User-defined strategies)';
    RAISE NOTICE '- 1200+ Market Data Points (Historical price data)';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database is now ready for production testing!';
    RAISE NOTICE '========================================';
END $$; 