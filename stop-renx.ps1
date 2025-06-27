# RenX Platform Stop Script
Write-Host "🛑 Stopping RenX Neural Trading Platform..."
Write-Host "==========================================="

# Function to stop service by PID file
function Stop-Service {
    param (
        [string]$serviceName
    )
    $pidFile = ".$($serviceName.ToLower())_pid"
    
    if (Test-Path $pidFile) {
        $processId = Get-Content $pidFile
        if (Get-Process -Id $processId -ErrorAction SilentlyContinue) {
            Write-Host "🔄 Stopping $serviceName (PID: $processId)..."
            Stop-Process -Id $processId -Force
            Remove-Item $pidFile
            Write-Host "✅ $serviceName stopped"
        } else {
            Write-Host "⚠️  $serviceName was not running"
            Remove-Item $pidFile
        }
    } else {
        Write-Host "ℹ️  No PID file found for $serviceName"
    }
}

# Stop all services
Write-Host ""
Write-Host "🔄 Stopping services..."
Write-Host "----------------------"
Stop-Service -serviceName "AI-Backend"
Stop-Service -serviceName "Main-Backend"

# Kill any remaining processes on our ports
Write-Host ""
Write-Host "🧹 Cleaning up remaining processes..."
Write-Host "------------------------------------"

# Kill processes on specific ports
foreach ($port in 3344, 8181) {
    $processId = (Get-NetTCPConnection -LocalPort $port -State Listen).OwningProcess
    if ($processId) {
        Write-Host "🔫 Killing process on port $port (PID: $processId)"
        Stop-Process -Id $processId -Force
    }
}

Write-Host ""
Write-Host "✅ All RenX services have been stopped"
Write-Host "======================================" 