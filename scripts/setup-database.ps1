# RenX Database Setup Script
Write-Host "🗄️  Setting up RenX Database..."
Write-Host "==============================="

# Check if psql is available
try {
    $null = & psql --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "psql not found"
    }
} catch {
    Write-Host "⚠️  PostgreSQL client (psql) not found in PATH."
    Write-Host "   Please ensure PostgreSQL is installed and psql is available."
    Write-Host "   Continuing without database setup..."
    exit 0
}

# Check if PostgreSQL is running
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if (-not $pgService -or $pgService.Status -ne "Running") {
        Write-Host "⚠️  PostgreSQL service is not running."
        Write-Host "   Please start PostgreSQL service or install PostgreSQL."
        Write-Host "   Continuing without database setup..."
        exit 0
    }
} catch {
    Write-Host "⚠️  Could not check PostgreSQL service status."
    Write-Host "   Continuing without database setup..."
    exit 0
}

# Database connection parameters
$env:PGPASSWORD = "renx_password"
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "renx_db"
$dbUser = "renx_admin"

Write-Host "🔗 Connecting to PostgreSQL..."

# Test connection first
try {
    $testConnection = & psql -h $dbHost -p $dbPort -U $dbUser -d postgres -c "SELECT 1;" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Cannot connect to PostgreSQL with credentials:"
        Write-Host "   Host: ${dbHost}:${dbPort}"
        Write-Host "   User: $dbUser"
        Write-Host "   Please ensure PostgreSQL is running and credentials are correct."
        Write-Host "   Continuing without database setup..."
        exit 0
    }
} catch {
    Write-Host "⚠️  Database connection test failed. Continuing without database setup..."
    exit 0
}

# Check if database exists
$dbExists = & psql -h $dbHost -p $dbPort -U $dbUser -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='$dbName';" 2>$null
if (-not $dbExists -or $dbExists.Trim() -ne "1") {
    Write-Host "📝 Creating database '$dbName'..."
    & createdb -h $dbHost -p $dbPort -U $dbUser $dbName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create database."
        exit 1
    }
}

Write-Host "🏗️  Initializing tenant management schema..."
& psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "init-tenant-management.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to initialize tenant management schema."
    exit 1
}

Write-Host "👤 Creating demo user..."
& psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "create-demo-user.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create demo user."
    exit 1
}

Write-Host "✅ Database setup completed successfully!"
Write-Host "========================================"
Write-Host "📊 Database: $dbName"
Write-Host "👤 Demo user: demo@renx.com (password: demo123)"
Write-Host "🏢 Demo tenant: demo_tenant" 