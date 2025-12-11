# Appwrite Hosting Deployment Guide

## Prerequisites
- Your Appwrite console access: http://75.119.150.209/console/project-default-693962bb002fb1f881bd/sites/create-site/manual
- Node.js 20+ installed locally
- Your codebase ready for production

## Step 1: Build Your Application

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Test the build locally
npm run start
```

## Step 2: Access Appwrite Console

1. Navigate to: http://75.119.150.209/console/project-default-693962bb002fb1f881bd/sites/create-site/manual
2. Sign in with your credentials
3. Click "Create Site" or "Manual Setup"

## Step 3: Configure Your Site

### Site Settings:
- **Site Name**: landsale-frontend
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`

### Environment Variables:
Use the variables from `.env.production`:
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=693962bb002fb1f881bd
NEXT_PUBLIC_APPWRITE_DATABASE_ID=osclass_landsale_db
# ... (all other variables)
```

## Step 4: Deploy

### Option A: Git Integration (Recommended)
1. Connect your Git repository
2. Set up automatic deployments on push to main branch
3. Configure build settings

### Option B: Manual Upload
1. Create a production build: `npm run build`
2. Zip the entire project (including `.next` folder)
3. Upload via Appwrite console

## Step 5: Domain Configuration

1. After deployment, Appwrite will provide a default domain
2. Optionally configure custom domain in site settings
3. Update `NEXT_PUBLIC_SITE_URL` in environment variables

## Step 6: Post-Deployment

1. Test all functionality
2. Verify database connections
3. Check user authentication
4. Validate file uploads to storage buckets

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify Appwrite endpoint and project ID
3. **Authentication Issues**: Ensure API key has proper permissions
4. **Storage Access**: Check bucket permissions and CORS settings

### Logs:
- Check deployment logs in Appwrite console
- Monitor application logs for runtime errors
- Use browser developer tools for client-side issues

## Production Checklist

- [ ] Environment variables configured
- [ ] Database collections created
- [ ] Storage buckets set up
- [ ] API keys have proper permissions
- [ ] Custom domain configured (optional)
- [ ] SSL certificates installed
- [ ] Performance optimizations applied
- [ ] Security headers configured
- [ ] Error handling implemented
- [ ] Monitoring set up