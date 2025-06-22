#!/bin/bash

# RenX Neural Trading Platform - Production Startup Script
echo "🚀 Starting RenX Neural Trading Platform (Production Mode)"

# Set production environment
export NODE_ENV=production
export PORT=3344
export AI_PORT=8181

# Health check endpoints
create_health_endpoints() {
    echo "Setting up health check endpoints..."
    # This would be handled by the application code
}

# Start AI Backend
start_ai_backend() {
    echo "🧠 Starting AI Backend Service..."
    cd /app/ai-backend
    python main.py &
    AI_PID=$!
    echo "AI Backend started with PID: $AI_PID"
    cd /app
}

# Start Main Application
start_main_app() {
    echo "🌐 Starting Main Application..."
    cd /app/server
    node dist/index.js &
    APP_PID=$!
    echo "Main Application started with PID: $APP_PID"
    cd /app
}

# Graceful shutdown handler
shutdown_handler() {
    echo "🛑 Shutting down services gracefully..."
    kill -TERM $AI_PID 2>/dev/null
    kill -TERM $APP_PID 2>/dev/null
    wait $AI_PID 2>/dev/null
    wait $APP_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Trap signals for graceful shutdown
trap shutdown_handler SIGTERM SIGINT

# Start services
create_health_endpoints
start_ai_backend
sleep 5  # Wait for AI backend to initialize
start_main_app

# Keep the script running
echo "✅ RenX Platform is running"
echo "📊 Main App: http://localhost:$PORT"
echo "🧠 AI API: http://localhost:$AI_PORT"
echo "📈 Health: http://localhost:$PORT/health"

# Wait for any process to exit
wait -n

# If we reach here, one of the processes has exited
echo "❌ A service has exited unexpectedly"
shutdown_handler
