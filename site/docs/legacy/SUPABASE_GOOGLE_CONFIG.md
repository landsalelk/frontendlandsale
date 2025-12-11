# Supabase Google Authentication Configuration

## Prerequisites
- Google OAuth 2.0 Client ID: `937216007837-3ceut2kl020gt9gbqh8ugbfejs5ukg6d.apps.googleusercontent.com`
- Supabase project URL: `https://ypvcvalchfvqywglobth.supabase.co`

## Configuration Steps

### 1. Obtain Google Client Secret
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Find the OAuth 2.0 Client ID: `937216007837-3ceut2kl020gt9gbqh8ugbfejs5ukg6d.apps.googleusercontent.com`
5. Click the pencil/edit icon to view the details
6. Copy the "Client Secret" value (you'll need this for Supabase configuration)

### 2. Configure Supabase Authentication Provider
1. Go to your Supabase project dashboard at https://app.supabase.com/project/ypvcvalchfvqywglobth
2. Navigate to "Authentication" > "Providers" in the left sidebar
3. Find the "Google" provider and click "Edit"
4. Enable the provider by toggling the switch
5. Fill in the following information:
   - Client ID: `937216007837-3ceut2kl020gt9gbqh8ugbfejs5ukg6d.apps.googleusercontent.com`
   - Secret: `[Your Google Client Secret from Step 1]`
6. Set the Callback URL to:
   ```
   https://ypvcvalchfvqywglobth.supabase.co/auth/v1/callback
   ```
7. Add the following Redirect URLs (one per line):
   ```
   http://localhost:3000/auth/callback
   https://landsale.lk/auth/callback
   ```
8. Click "Save"

### 3. Update Your Google Cloud Console Settings
1. In the Google Cloud Console, navigate to "APIs & Services" > "Credentials"
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized JavaScript origins", add:
   ```
   http://localhost:3000
   https://landsale.lk
   ```
4. Under "Authorized redirect URIs", ensure you have:
   ```
   http://localhost:3000/auth/callback
   https://landsale.lk/auth/callback
   https://ypvcvalchfvqywglobth.supabase.co/auth/v1/callback
   ```

### 4. Test the Configuration
1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Visit http://localhost:3000/login or http://localhost:3000/signup
3. You should see:
   - Google One Tap prompt (may take a few seconds to appear)
   - "Continue with Google" button
   
### 5. Production Deployment
1. When deploying to production, ensure your environment variables are set:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ypvcvalchfvqywglobth.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdmN2YWxjaGZ2cXl3Z2xvYnRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MzI1MTksImV4cCI6MjA4MDQwODUxOX0.jiaidbQsKX2YCKFAlXP9qcDsB2kzD0E9m8ier8TMKag
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=937216007837-3ceut2kl020gt9gbqh8ugbfejs5ukg6d.apps.googleusercontent.com
   ```
2. Your Docker deployment should already include these values from the .env.local file

## Troubleshooting

### Common Issues
1. **"Invalid Client ID" Error**
   - Verify the Client ID matches exactly: `937216007837-3ceut2kl020gt9gbqh8ugbfejs5ukg6d.apps.googleusercontent.com`
   - Ensure the Client Secret is correct

2. **Redirect URI Mismatch**
   - Double-check that all redirect URIs are properly configured in both Google Cloud Console and Supabase

3. **Google One Tap Not Appearing**
   - Try in an incognito window
   - Ensure third-party cookies are enabled
   - Check browser console for errors

### Need Help?
If you encounter issues, check the browser console for detailed error messages and refer to the main setup guide in `GOOGLE_AUTH_SETUP.md`.