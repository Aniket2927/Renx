#!/bin/bash

# RenX Platform Stop Script
echo "🛑 Stopping RenX Neural Trading Platform..."
echo "==========================================="

# Function to stop service by PID file
stop_service() {
    local service_name=$1
    local pid_file=".$(echo $service_name | tr '[:upper:]' '[:lower:]')_pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            echo "🔄 Stopping $service_name (PID: $pid)..."
            kill $pid
            rm "$pid_file"
            echo "✅ $service_name stopped"
        else
            echo "⚠️  $service_name was not running"
            rm "$pid_file"
        fi
    else
        echo "ℹ️  No PID file found for $service_name"
    fi
}

# Stop all services
echo ""
echo "🔄 Stopping services..."
echo "----------------------"
stop_service "AI-Backend"
stop_service "Main-Backend"

# Kill any remaining processes on our ports
echo ""
echo "🧹 Cleaning up remaining processes..."
echo "------------------------------------"

# Kill processes on specific ports
for port in 3344 8181; do
    pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🔫 Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
    fi
done

echo ""
echo "✅ All RenX services have been stopped"
echo "======================================" 