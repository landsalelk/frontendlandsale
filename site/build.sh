#!/bin/bash

# Build script for Docker with environment variables
echo "🏗️ Building Next.js application with environment variables..."

# Set environment variables for build
export NEXT_PUBLIC_SUPABASE_URL=http://supabasekong-k0sg4c08ow0goko4s8480coc.75.119.150.209.sslip.io
export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTEzNDA2MCwiZXhwIjo0OTIwODA3NjYwLCJyb2xlIjoiYW5vbiJ9.cVYpeWlTiICdLfVAlX7nuJQTtdTcEq_xps_Dhpij6pw
export NEXT_PUBLIC_GOOGLE_CLIENT_ID=937216007837-3ceut2kl020gt9gbqh8ugbfejs5ukg6d.apps.googleusercontent.com
export NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyAttPi1U7lXiOoZgP_0rRoiciHsO3sPYfkAIzaSyAttPi1U7lXiOoZgP_0rRoiciHsO3sPYfk
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Run the build
echo "🔨 Running Next.js build..."
npm run build

echo "✅ Build completed successfully!"