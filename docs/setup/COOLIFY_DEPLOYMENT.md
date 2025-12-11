# Coolify Deployment Configuration

## Environment Variables Required
NEXT_PUBLIC_SUPABASE_URL=http://supabasekong-k0sg4c08ow0goko4s8480coc.75.119.150.209.sslip.io
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTEzNDA2MCwiZXhwIjo0OTIwODA3NjYwLCJyb2xlIjoiYW5vbiJ9.cVYpeWlTiICdLfVAlX7nuJQTtdTcEq_xps_Dhpij6pw
NEXT_PUBLIC_GOOGLE_CLIENT_ID=937216007837-3ceut2kl020gt9gbqh8ugbfejs5ukg6d.apps.googleusercontent.com
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

## Build Configuration
- Build Command: `npm run build`
- Start Command: `npm start`
- Port: `3000`
- Health Check: `/` (root path)

## Docker Configuration
- Uses multi-stage build with Node.js 20 Alpine
- Optimized for production
- Includes all necessary dependencies

## Deployment Steps
1. Connect Git repository to Coolify
2. Set environment variables
3. Configure build settings
4. Deploy application
5. Configure custom domain (optional)