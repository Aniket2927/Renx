#!/bin/bash

# RenX Environment Configuration
# This script sets up environment variables for the RenX platform

echo "🔧 Setting up RenX Environment Variables..."

# API Keys
export TWELVE_DATA_API_KEY="353ddad011164bea9e7d8aea53138956"
export ALPHA_VANTAGE_API_KEY="your_alpha_vantage_api_key"
export VITE_TWELVEDATA_API_KEY="353ddad011164bea9e7d8aea53138956"

# Database Configuration
export DATABASE_URL="postgresql://renx_admin:renx_password@localhost:5432/renx_db"
export POSTGRES_PASSWORD="renx_password"

# Application Configuration
export NODE_ENV="development"
export PORT="3344"
export AI_BACKEND_PORT="8181"
export VITE_API_URL="http://localhost:3344"

# JWT Configuration
export JWT_SECRET="renx_jwt_secret_dev_2024"
export JWT_EXPIRES_IN="24h"

# Disable Kafka for development
export KAFKA_ENABLED="false"
export KAFKAJS_NO_PARTITIONER_WARNING="1"

echo "✅ Environment variables configured successfully!"
echo "📊 Twelve Data API Key: ****$(echo $TWELVE_DATA_API_KEY | tail -c 5)"
echo "🌐 API URL: $VITE_API_URL"
echo "🔧 Backend Port: $PORT"
echo "🧠 AI Backend Port: $AI_BACKEND_PORT" 