# RenX Environment Configuration
# This script sets up environment variables for the RenX platform

Write-Host "🔧 Setting up RenX Environment Variables..."

# API Keys
$env:TWELVE_DATA_API_KEY = "353ddad011164bea9e7d8aea53138956"
$env:ALPHA_VANTAGE_API_KEY = "your_alpha_vantage_api_key"
$env:VITE_TWELVEDATA_API_KEY = "353ddad011164bea9e7d8aea53138956"

# Database Configuration
$env:DATABASE_URL = "postgresql://renx_admin:renx_password@localhost:5432/renx_db"
$env:POSTGRES_PASSWORD = "renx_password"

# Application Configuration
$env:NODE_ENV = "development"
$env:PORT = "3344"
$env:AI_BACKEND_PORT = "8181"
$env:VITE_API_URL = "http://localhost:3344"

# JWT Configuration
$env:JWT_SECRET = "renx_jwt_secret_dev_2024"
$env:JWT_EXPIRES_IN = "24h"

# Disable Kafka for development
$env:KAFKA_ENABLED = "false"
$env:KAFKAJS_NO_PARTITIONER_WARNING = "1"

Write-Host "✅ Environment variables configured successfully!"
Write-Host "📊 Twelve Data API Key: ****$(($env:TWELVE_DATA_API_KEY).Substring($env:TWELVE_DATA_API_KEY.Length - 4))"
Write-Host "🌐 API URL: $env:VITE_API_URL"
Write-Host "🔧 Backend Port: $env:PORT"
Write-Host "🧠 AI Backend Port: $env:AI_BACKEND_PORT" 