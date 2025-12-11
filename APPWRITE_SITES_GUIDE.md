# Appwrite Sites Management Guide

## Current Sites Status

### Active Site
**Name**: My website  
**ID**: 6939fe680032bfcb3d36  
**Framework**: Next.js  
**Status**: Not deployed  
**Created**: December 11, 2025  

### Issues to Resolve
1. **Repository Configuration**: No repository linked
2. **Branch Configuration**: No deployment branch set
3. **Deployment Status**: Site not deployed
4. **API Permissions**: Missing "public" scope

## Site Management Options

### 1. Configure Site Repository
To deploy your site, you need to connect it to a Git repository:

```bash
# Using Appwrite CLI (if available)
appwrite sites update \
  --site-id 6939fe680032bfcb3d36 \
  --repository https://github.com/your-username/your-repo \
  --branch main \
  --root-directory /
```

### 2. Deploy Your Site
Once repository is configured:

```bash
# Deploy the site
appwrite sites createDeployment \
  --site-id 6939fe680032bfcb3d36
```

### 3. Environment Variables for Site
Add these to your site configuration:

```bash
# Site-specific environment variables
NEXT_PUBLIC_SITE_URL=https://your-site-url.appwrite.app
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=693962bb002fb1f881bd
```

### 4. Build Configuration
For Next.js sites, ensure your build settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

## Alternative Deployment Options

Since your current Appwrite instance may have permission issues, consider these alternatives:

### Option 1: Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### Option 2: Netlify Deployment
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy to Netlify
netlify deploy --prod
```

### Option 3: Traditional Hosting
- **Shared Hosting**: Upload build files to cPanel
- **VPS**: Use PM2 + Nginx
- **Docker**: Containerize your application

## Next Steps

1. **Fix API Permissions**: Update your Appwrite API key to include "public" scope
2. **Configure Repository**: Link your GitHub/GitLab repository
3. **Set Build Settings**: Configure build command and output directory
4. **Deploy**: Trigger deployment through Appwrite console or CLI
5. **Monitor**: Check deployment logs and site status

## Troubleshooting

### Common Issues
- **Permission Denied**: Ensure API key has proper scopes
- **Build Fails**: Check build command and dependencies
- **Repository Access**: Verify repository permissions and webhook setup
- **Domain Issues**: Configure custom domain if needed

### Getting Help
- Check Appwrite documentation: https://appwrite.io/docs
- Review deployment logs in Appwrite console
- Verify repository webhook configuration
- Test build locally before deployment

## Current Recommendation

Given the permission issues with your current Appwrite instance, I recommend using **Vercel** for deployment as it provides:
- Better Next.js optimization
- Automatic deployments from Git
- Built-in CDN and performance features
- Easier configuration and management