# RenX Quick Startup Test
Write-Host "🧪 Testing RenX Platform Startup..."
Write-Host "===================================="

# First, stop any existing services
Write-Host "🛑 Stopping existing services..."
if (Test-Path "stop-renx.ps1") {
    & .\stop-renx.ps1
}

# Wait a moment for cleanup
Start-Sleep -Seconds 3

# Test 1: Check if required files exist
Write-Host ""
Write-Host "📁 Checking required files..."
$requiredFiles = @(
    "start-renx.ps1",
    "env-config.ps1", 
    "ai-backend\main.py",
    "scripts\init-tenant-management.sql",
    "scripts\create-demo-user.sql"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
        Write-Host "❌ Missing: $file"
    } else {
        Write-Host "✅ Found: $file"
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Some required files are missing. Please check your installation."
    exit 1
}

# Test 2: Check ports availability
Write-Host ""
Write-Host "🔌 Checking port availability..."
$portsToCheck = @(3344, 8181)
foreach ($port in $portsToCheck) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "⚠️  Port $port is already in use"
    } else {
        Write-Host "✅ Port $port is available"
    }
}

# Test 3: Start the platform
Write-Host ""
Write-Host "🚀 Starting RenX Platform..."
& .\start-renx.ps1

Write-Host ""
Write-Host "✅ Startup test completed!"
Write-Host "==========================" 