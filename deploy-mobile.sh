#!/bin/bash

# Phase 4: Mobile & Production Readiness - Deployment Script
# RenX Neural Trading Platform - Mobile App Deployment

set -e

# Configuration
VERSION=${1:-latest}
ENVIRONMENT=${2:-production}
PLATFORM=${3:-all}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "=========================================="
echo "  RenX Mobile App Deployment Script"
echo "  Phase 4: Mobile & Production Readiness"
echo "=========================================="
echo -e "${NC}"

# Validate prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18 or later."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18 or later is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed."
        exit 1
    fi
    
    # Check if Expo CLI is installed
    if ! command -v expo &> /dev/null; then
        log_warning "Expo CLI not found. Installing..."
        npm install -g @expo/cli
    fi
    
    # Check if EAS CLI is installed
    if ! command -v eas &> /dev/null; then
        log_warning "EAS CLI not found. Installing..."
        npm install -g eas-cli
    fi
    
    # Check if kubectl is installed (for Kubernetes deployment)
    if [ "$ENVIRONMENT" = "kubernetes" ] && ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed. Required for Kubernetes deployment."
        exit 1
    fi
    
    # Check if Docker is installed (for containerized deployment)
    if [ "$ENVIRONMENT" = "docker" ] && ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Required for Docker deployment."
        exit 1
    fi
    
    log_success "Prerequisites check completed."
}

# Setup mobile environment
setup_mobile_environment() {
    log_info "Setting up mobile development environment..."
    
    cd mobile
    
    # Install dependencies
    log_info "Installing mobile app dependencies..."
    npm ci
    
    # Configure environment variables
    if [ ! -f ".env" ]; then
        log_info "Creating .env file from template..."
        cp .env.example .env 2>/dev/null || echo "# Mobile App Environment Variables" > .env
    fi
    
    # Set production environment variables
    if [ "$ENVIRONMENT" = "production" ]; then
        cat > .env << EOF
# Production Environment Variables
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://api.renx.ai
EXPO_PUBLIC_AI_API_URL=https://ai.renx.ai
EXPO_PUBLIC_WS_URL=wss://ws.renx.ai
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_VERSION=$VERSION
EOF
    else
        cat > .env << EOF
# Development Environment Variables
NODE_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3344
EXPO_PUBLIC_AI_API_URL=http://localhost:8181
EXPO_PUBLIC_WS_URL=ws://localhost:3344
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_VERSION=$VERSION
EOF
    fi
    
    log_success "Mobile environment setup completed."
}

# Build mobile app
build_mobile_app() {
    log_info "Building mobile app for platform: $PLATFORM"
    
    cd mobile
    
    # Pre-build checks
    log_info "Running pre-build checks..."
    npm run lint 2>/dev/null || log_warning "Linting issues found but continuing..."
    
    # Build for specified platform
    case $PLATFORM in
        "ios")
            log_info "Building iOS app..."
            if [ "$ENVIRONMENT" = "production" ]; then
                eas build --platform ios --non-interactive --clear-cache
            else
                expo build:ios --type simulator
            fi
            ;;
        "android")
            log_info "Building Android app..."
            if [ "$ENVIRONMENT" = "production" ]; then
                eas build --platform android --non-interactive --clear-cache
            else
                expo build:android --type apk
            fi
            ;;
        "all"|*)
            log_info "Building for both iOS and Android..."
            if [ "$ENVIRONMENT" = "production" ]; then
                eas build --platform all --non-interactive --clear-cache
            else
                expo build:ios --type simulator &
                IOS_PID=$!
                expo build:android --type apk &
                ANDROID_PID=$!
                wait $IOS_PID
                wait $ANDROID_PID
            fi
            ;;
    esac
    
    log_success "Mobile app build completed."
}

# Deploy to app stores
deploy_to_stores() {
    if [ "$ENVIRONMENT" != "production" ]; then
        log_warning "App store deployment only available in production environment."
        return
    fi
    
    log_info "Deploying to app stores..."
    
    cd mobile
    
    # Submit to App Store
    if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "all" ]; then
        log_info "Submitting to Apple App Store..."
        eas submit --platform ios --non-interactive
    fi
    
    # Submit to Google Play
    if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
        log_info "Submitting to Google Play Store..."
        eas submit --platform android --non-interactive
    fi
    
    log_success "App store deployment completed."
}

# Deploy with Kubernetes
deploy_kubernetes() {
    log_info "Deploying mobile build pipeline to Kubernetes..."
    
    # Apply Kubernetes configurations
    kubectl apply -f k8s/mobile-deployment.yaml
    
    # Wait for deployment to be ready
    kubectl wait --for=condition=available --timeout=300s deployment/renx-mobile-builder -n renx-production
    
    # Get service endpoints
    log_info "Getting service endpoints..."
    kubectl get services -n renx-production | grep renx-mobile
    
    log_success "Kubernetes deployment completed."
}

# Deploy with Docker
deploy_docker() {
    log_info "Deploying mobile app with Docker..."
    
    # Build Docker image for mobile development
    docker build -t renx-mobile:$VERSION -f mobile/Dockerfile mobile/
    
    # Run mobile development container
    docker run -d \
        --name renx-mobile-$VERSION \
        -p 19000:19000 \
        -p 19001:19001 \
        -p 19002:19002 \
        -v $(pwd)/mobile:/app \
        -v mobile_node_modules:/app/node_modules \
        renx-mobile:$VERSION
    
    log_success "Docker deployment completed."
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    case $ENVIRONMENT in
        "kubernetes")
            # Check Kubernetes pods
            kubectl get pods -n renx-production | grep renx-mobile
            ;;
        "docker")
            # Check Docker containers
            docker ps | grep renx-mobile
            ;;
        "production"|"development")
            # Check if Expo dev server is running
            if curl -s http://localhost:19000 > /dev/null; then
                log_success "Mobile development server is running."
            else
                log_warning "Mobile development server is not accessible."
            fi
            ;;
    esac
    
    log_success "Health check completed."
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    
    # Clean up build artifacts
    cd mobile
    rm -rf build/ dist/ .expo/ 2>/dev/null || true
    
    log_success "Cleanup completed."
}

# Main deployment flow
main() {
    log_info "Starting mobile app deployment..."
    log_info "Version: $VERSION"
    log_info "Environment: $ENVIRONMENT"
    log_info "Platform: $PLATFORM"
    
    # Check prerequisites
    check_prerequisites
    
    # Setup environment
    setup_mobile_environment
    
    # Build mobile app
    build_mobile_app
    
    # Deploy based on environment
    case $ENVIRONMENT in
        "kubernetes")
            deploy_kubernetes
            ;;
        "docker")
            deploy_docker
            ;;
        "production")
            deploy_to_stores
            ;;
        "development")
            log_info "Starting development server..."
            cd mobile
            npm start
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            log_info "Supported environments: development, production, docker, kubernetes"
            exit 1
            ;;
    esac
    
    # Health check
    health_check
    
    # Success message
    log_success "Mobile app deployment completed successfully!"
    
    # Display access information
    case $ENVIRONMENT in
        "development")
            echo -e "${GREEN}"
            echo "=========================================="
            echo "  Mobile App Development Server"
            echo "=========================================="
            echo "Metro Bundler: http://localhost:19000"
            echo "Dev Tools: http://localhost:19001"
            echo "Tunnel: http://localhost:19002"
            echo ""
            echo "Scan QR code with Expo Go app to test on device"
            echo "=========================================="
            echo -e "${NC}"
            ;;
        "production")
            echo -e "${GREEN}"
            echo "=========================================="
            echo "  Production Deployment Completed"
            echo "=========================================="
            echo "iOS App: Submitted to App Store"
            echo "Android App: Submitted to Google Play"
            echo "Version: $VERSION"
            echo "=========================================="
            echo -e "${NC}"
            ;;
    esac
}

# Trap cleanup on exit
trap cleanup EXIT

# Run main function
main "$@" 