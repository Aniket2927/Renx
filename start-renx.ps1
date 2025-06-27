# RenX Platform Startup Script
Write-Host "🌟 Starting RenX Neural Trading Platform..."
Write-Host "=========================================="

# Load environment configuration
if (Test-Path "env-config.ps1") {
    . ".\env-config.ps1"
} else {
    Write-Host "⚠️  env-config.ps1 not found. Setting basic environment variables..."
    $env:TWELVE_DATA_API_KEY = "353ddad011164bea9e7d8aea53138956"
    $env:VITE_TWELVEDATA_API_KEY = "353ddad011164bea9e7d8aea53138956"
    $env:DATABASE_URL = "postgresql://renx_admin:renx_password@localhost:5432/renx_db"
    $env:NODE_ENV = "development"
    $env:KAFKA_ENABLED = "false"
    $env:KAFKAJS_NO_PARTITIONER_WARNING = "1"
}

# Function to check if port is in use
function Check-Port {
    param (
        [int]$port
    )
    $connection = Test-NetConnection -ComputerName localhost -Port $port
    return $connection.TcpTestSucceeded
}

# Function to start service in background
function Start-Service {
    param (
        [string]$serviceName,
        [string]$command,
        [int]$port
    )
    
    Write-Host "🚀 Starting $serviceName on port $port..."
    
    if (Check-Port -port $port) {
        Write-Host "❌ Cannot start $serviceName - port $port is busy"
        # Try to find and kill the process using the port
        try {
            $processIds = (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue).OwningProcess
            if ($processIds) {
                foreach ($pid in $processIds) {
                    Write-Host "🔫 Killing process $pid on port $port"
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                }
                Start-Sleep -Seconds 2
            }
        } catch {
            Write-Host "⚠️  Could not clear port $port automatically"
        }
    }
    
    # Create unique log file name with timestamp
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $logFile = "logs\$($serviceName.ToLower())_$timestamp.log"
    $updatedCommand = $command -replace '>\s*[^>]*\.log', "> $logFile"
    
    try {
        $process = Start-Process -FilePath PowerShell -ArgumentList "-Command $updatedCommand" -NoNewWindow -PassThru
        
        # Save PID for cleanup
        $pidFile = ".$($serviceName.ToLower())_pid"
        $process.Id | Out-File -FilePath $pidFile -Encoding ASCII
        
        Write-Host "✅ $serviceName started (PID: $($process.Id), Log: $logFile)"
    } catch {
        Write-Host "❌ Failed to start $serviceName"
    }
}

# Create logs directory
if (-Not (Test-Path -Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
}

# Clear old log files to prevent conflicts
Write-Host "🧹 Clearing old log files..."
if (Test-Path "logs\ai-backend.log") { Remove-Item "logs\ai-backend.log" -Force }
if (Test-Path "logs\backend.log") { Remove-Item "logs\backend.log" -Force }

# Setup database
Write-Host ""
Write-Host "🗄️  Phase 0: Database Setup..."
Write-Host "-----------------------------"
if (Test-Path "scripts\setup-database.ps1") {
    Set-Location "scripts"
    & .\setup-database.ps1
    Set-Location ".."
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Database setup failed. Please check your PostgreSQL configuration."
        exit 1
    }
} else {
    Write-Host "⚠️  Database setup script not found. Continuing without database initialization..."
}

Write-Host ""
Write-Host "🧠 Phase 1: Starting AI Backend (Python FastAPI)..."
Write-Host "---------------------------------------------------"
$env:AI_BACKEND_PORT = "8181"
$env:AI_BACKEND_HOST = "0.0.0.0"
$aiBackendCmd = "cd ai-backend; `$env:AI_BACKEND_PORT='8181'; `$env:AI_BACKEND_HOST='0.0.0.0'; .\venv\Scripts\activate; python main.py"
Start-Service -serviceName "AI-Backend" -command $aiBackendCmd -port 8181

Write-Host ""
Write-Host "🖥️  Phase 2: Starting Main Backend (Node.js)..."
Write-Host "-----------------------------------------------"
# Environment variables are already set by env-config.ps1
$backendCmd = "npm run dev > logs/backend.log 2>&1"
Start-Service -serviceName "Main-Backend" -command $backendCmd -port 3344

Write-Host ""
Write-Host "🎨 Phase 3: Frontend is served by the main backend via Vite..."
Write-Host "-----------------------------------------------------------"

Write-Host ""
Write-Host "⏳ Waiting for services to initialize..."
Write-Host "   AI Backend loading ML models..."
Start-Sleep -Seconds 12
Write-Host "   Backend connecting to database..."
Start-Sleep -Seconds 8
Write-Host "   Services fully starting up..."
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🔍 Checking service health..."
Write-Host "=============================="

# Check AI Backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8181/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ AI Backend: Healthy (http://localhost:8181)"
    } else {
        Write-Host "❌ AI Backend: Not responding correctly"
    }
} catch {
    Write-Host "❌ AI Backend: Not responding"
}

# Check Main Backend  
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3344/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Main Backend: Healthy (http://localhost:3344)"
    } else {
        Write-Host "❌ Main Backend: Not responding correctly"
    }
} catch {
    Write-Host "❌ Main Backend: Not responding"
}

# Check Frontend (served by main backend)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3344" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend: Healthy (served at http://localhost:3344)"
    } else {
        Write-Host "❌ Frontend: Not responding correctly"
    }
} catch {
    Write-Host "❌ Frontend: Not responding"
}

Write-Host ""
Write-Host "🎯 RenX Platform Status"
Write-Host "======================"
Write-Host "🌐 Frontend:     http://localhost:3344"
Write-Host "🔧 Backend API:  http://localhost:3344"
Write-Host "🧠 AI Backend:   http://localhost:8181"
Write-Host "📊 API Docs:     http://localhost:8181/docs"
Write-Host ""
Write-Host "📁 Logs are available in the ./logs/ directory"
Write-Host ""
Write-Host "🛑 To stop all services, run: ./stop-renx.ps1"
Write-Host ""
Write-Host "✨ RenX Neural Trading Platform is ready!"
Write-Host "==========================================" 