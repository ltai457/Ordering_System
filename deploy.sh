#!/bin/bash

# Deployment Script for Digital Ocean Droplet
# Usage: ./deploy.sh [component]
# Components: all, backend, frontend, staff
# Example: ./deploy.sh all

set -e  # Exit on error

COMPONENT=${1:-all}
API_DIR="/home/deployer/Ordering_System/DigitalMenuSystem.API"
API_PROD_DIR="/home/deployer/api-production"
CUSTOMER_APP_DIR="/home/deployer/Ordering_System/customer-app"
STAFF_DASHBOARD_DIR="/home/deployer/Ordering_System/staff-dashboard"
WEB_CUSTOMER="/var/www/customer-app"
WEB_STAFF="/var/www/staff-dashboard"

echo "🚀 Starting deployment for: $COMPONENT"
echo "================================"

# Navigate to project directory
cd /home/deployer/Ordering_System

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin DigitalOcean

# Deploy Backend
if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "backend" ]; then
    echo ""
    echo "🔧 Deploying Backend API..."
    echo "================================"

    # Navigate to API directory
    cd "$API_DIR"

    # Restore and build
    echo "Building .NET API..."
    dotnet restore
    dotnet build --configuration Release
    dotnet publish -c Release -o ./publish

    # Kill old API process
    echo "Stopping old API process..."
    pkill -f "DigitalMenuSystem.API.dll" || true
    sleep 2

    # Copy new build to production
    echo "Deploying new API build..."
    rm -rf "$API_PROD_DIR"/*
    cp -r ./publish/* "$API_PROD_DIR/"

    # Start new API process in background
    echo "Starting new API process..."
    cd "$API_PROD_DIR"
    nohup dotnet DigitalMenuSystem.API.dll > /dev/null 2>&1 &

    # Wait a moment for startup
    sleep 3

    # Check if API is running
    if pgrep -f "DigitalMenuSystem.API.dll" > /dev/null; then
        echo "✅ Backend API deployed successfully!"
        echo "   PID: $(pgrep -f 'DigitalMenuSystem.API.dll')"
    else
        echo "❌ Backend API failed to start!"
        exit 1
    fi
fi

# Deploy Customer App
if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "frontend" ]; then
    echo ""
    echo "🎨 Deploying Customer App..."
    echo "================================"

    cd "$CUSTOMER_APP_DIR"

    # Install dependencies and build
    echo "Installing dependencies..."
    npm install

    echo "Building customer app..."
    npm run build

    # Deploy to web directory
    echo "Deploying to web server..."
    sudo rm -rf "$WEB_CUSTOMER"/*
    sudo cp -r dist/* "$WEB_CUSTOMER/"

    # Set correct permissions
    sudo chown -R www-data:www-data "$WEB_CUSTOMER"
    sudo chmod -R 755 "$WEB_CUSTOMER"

    echo "✅ Customer App deployed successfully!"
fi

# Deploy Staff Dashboard
if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "staff" ]; then
    echo ""
    echo "👨‍💼 Deploying Staff Dashboard..."
    echo "================================"

    cd "$STAFF_DASHBOARD_DIR"

    # Install dependencies and build
    echo "Installing dependencies..."
    npm install

    echo "Building staff dashboard..."
    npm run build

    # Deploy to web directory
    echo "Deploying to web server..."
    sudo rm -rf "$WEB_STAFF"/*
    sudo cp -r dist/* "$WEB_STAFF/"

    # Set correct permissions
    sudo chown -R www-data:www-data "$WEB_STAFF"
    sudo chmod -R 755 "$WEB_STAFF"

    echo "✅ Staff Dashboard deployed successfully!"
fi

# Restart nginx
echo ""
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

echo ""
echo "================================"
echo "🎉 Deployment completed successfully!"
echo "================================"
echo ""
echo "📊 Status Check:"
echo "- Backend API PID: $(pgrep -f 'DigitalMenuSystem.API.dll' || echo 'NOT RUNNING')"
echo "- Nginx status: $(systemctl is-active nginx)"
echo ""
