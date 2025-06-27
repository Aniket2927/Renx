#!/bin/bash

# RenX Platform Startup Script
echo "🌟 Starting RenX Neural Trading Platform..."
echo "=========================================="

# Load environment configuration
if [ -f "env-config.sh" ]; then
    source ./env-config.sh
else
    echo "⚠️  env-config.sh not found. Setting basic environment variables..."
    export TWELVE_DATA_API_KEY="353ddad011164bea9e7d8aea53138956"
    export VITE_TWELVEDATA_API_KEY="353ddad011164bea9e7d8aea53138956"
    export DATABASE_URL="postgresql://renx_admin:renx_password@localhost:5432/renx_db"
    export NODE_ENV="development"
    export KAFKA_ENABLED="false"
    export KAFKAJS_NO_PARTITIONER_WARNING="1"
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Function to start service in background
start_service() {
    local service_name=$1
    local command=$2
    local port=$3
    
    echo "🚀 Starting $service_name on port $port..."
    
    if check_port $port; then
        eval "$command" &
        local pid=$!
        echo "✅ $service_name started with PID $pid"
        echo $pid > ".$(echo $service_name | tr '[:upper:]' '[:lower:]')_pid"
    else
        echo "❌ Cannot start $service_name - port $port is busy"
    fi
}

# Create logs directory
mkdir -p logs

echo ""
echo "🧠 Phase 1: Starting AI Backend (Python FastAPI)..."
echo "---------------------------------------------------"
start_service "AI-Backend" "cd ai-backend && ./start.sh > ../logs/ai-backend.log 2>&1" 8181

echo ""
echo "🖥️  Phase 2: Starting Main Backend (Node.js)..."
echo "-----------------------------------------------"
start_service "Main-Backend" "npm run dev > logs/backend.log 2>&1" 3344

echo ""
echo "🎨 Phase 3: Frontend is served by the main backend via Vite..."
echo "-----------------------------------------------------------"

echo ""
echo "⏳ Waiting for services to initialize..."
echo "   AI Backend loading ML models..."
sleep 12
echo "   Backend connecting to database..."
sleep 8
echo "   Services fully starting up..."
sleep 5

echo ""
echo "🔍 Checking service health..."
echo "=============================="

# Check AI Backend
if curl -s --max-time 5 http://localhost:8181/health > /dev/null 2>&1; then
    echo "✅ AI Backend: Healthy (http://localhost:8181)"
else
    echo "❌ AI Backend: Not responding"
fi

# Check Main Backend  
if curl -s --max-time 5 http://localhost:3344/health > /dev/null 2>&1; then
    echo "✅ Main Backend: Healthy (http://localhost:3344)"
else
    echo "❌ Main Backend: Not responding"
fi

# Check Frontend (served by main backend)
if curl -s --max-time 5 http://localhost:3344 > /dev/null 2>&1; then
    echo "✅ Frontend: Healthy (served at http://localhost:3344)"
else
    echo "❌ Frontend: Not responding"
fi

# Check AI Integration
if curl -s --max-time 5 http://localhost:3344/api/ai/health > /dev/null 2>&1; then
    echo "✅ AI Integration: Healthy (http://localhost:3344/api/ai/health)"
else
    echo "❌ AI Integration: Not responding"
fi

echo ""
echo "🎯 RenX Platform Status"
echo "======================"
echo "🌐 Frontend:     http://localhost:3344"
echo "🔧 Backend API:  http://localhost:3344"
echo "🧠 AI Backend:   http://localhost:8181"
echo "📊 API Docs:     http://localhost:8181/docs"
echo ""
echo "📁 Logs are available in the ./logs/ directory"
echo ""
echo "🛑 To stop all services, run: ./stop-renx.sh"
echo ""
echo "✨ RenX Neural Trading Platform is ready!"
echo "==========================================" 