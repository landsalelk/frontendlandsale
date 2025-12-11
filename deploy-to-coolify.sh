#!/bin/bash

# Coolify Docker Deployment Script
# This script builds and deploys your Next.js app to Coolify

echo "🚀 Starting Coolify Docker Deployment..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -f Dockerfile.optimized -t landsale-frontend .

# Tag the image for Coolify
echo "🏷️ Tagging image for Coolify..."
docker tag landsale-frontend:latest landsale-frontend:coolify

# Optional: Save the image to a tar file
echo "💾 Saving image to tar file..."
docker save landsale-frontend:coolify > landsale-frontend.tar

echo "✅ Docker build completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to your Coolify dashboard: http://supabasekong-k0sg4c08ow0goko4s8480coc.75.119.150.209.sslip.io:8000"
echo "2. Create a new project"
echo "3. Choose 'Docker' as deployment method"
echo "4. Upload the landsale-frontend.tar file or use Docker Hub"
echo "5. Set environment variables in Coolify"
echo "6. Deploy!"
echo ""
echo "🔧 Environment variables to set in Coolify:"
echo "- NEXT_PUBLIC_SUPABASE_URL=http://supabasekong-k0sg4c08ow0goko4s8480coc.75.119.150.209.sslip.io"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTEzNDA2MCwiZXhwIjo0OTIwODA3NjYwLCJyb2xlIjoiYW5vbiJ9.cVYpeWlTiICdLfVAlX7nuJQTtdTcEq_xps_Dhpij6pw"
echo "- NEXT_PUBLIC_GOOGLE_CLIENT_ID=937216007837-3ceut2kl020gt9gbqh8ugbfejs5ukg6d.apps.googleusercontent.com"
echo "- NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key"