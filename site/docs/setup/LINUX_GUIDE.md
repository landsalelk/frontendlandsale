# LandSale.lk - Linux Deployment Guide

This archive contains the source code for the LandSale.lk frontend application, ready for deployment on a Linux server (Ubuntu/Debian/CentOS).

## Prerequisites
- Node.js 18.17 or later
- NPM or Yarn or PNPM
- A Supabase project (credentials required)

## Installation Steps

1. **Unzip the project**
   ```bash
   unzip landsale-linux-ready.zip
   cd landsale-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure Environment Variables**
   The archive might contain a `.env.local` file. For production, rename it or ensure variables are set in your OS/Deployment tool.
   ```bash
   cp .env.local .env.production
   ```
   
   **Critical Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: (Optional) Required for admin tasks/password reset bypass
   - `NEXT_PUBLIC_SITE_URL`: Your production domain (e.g., https://landsale.lk)

4. **Build the Application**
   ```bash
   npm run build
   ```

5. **Start Production Server**
   ```bash
   npm start
   # Runs on port 3000 by default. Set PORT=3005 npm start to change port.
   ```

## Using PM2 (Recommended for Production)
To keep the app running in the background:
```bash
npm install -g pm2
pm2 start npm --name "landsale-frontend" -- start
pm2 save
```

## Troubleshooting
- **Missing Images:** Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct.
- **404 Errors:** Ensure `NEXT_PUBLIC_SITE_URL` is set correctly for redirects.
