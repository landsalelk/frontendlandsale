# Google One Tap Login Setup with Supabase

## Prerequisites

1. A Google Cloud Project with the Google+ API enabled
2. OAuth 2.0 Client ID credentials from Google Cloud Console
3. Supabase project with Google Auth enabled

## Setup Instructions

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add the following authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (for development)
     - `https://your-domain.com/auth/callback` (for production)
   - Note the Client ID (you'll need this for the environment variables)

### 2. Configure Supabase Authentication

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Enable the Google provider
4. Enter the following information:
   - Client ID: Your Google OAuth Client ID
   - Secret: Your Google OAuth Client Secret
   - Callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Additional URLs:
     - `http://localhost:3000/auth/callback` (for development)
     - `https://your-domain.com/auth/callback` (for production)

### 3. Update Environment Variables

Update your `.env.local` file with your actual Google Client ID:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_google_client_id
```

### 4. Configure Google One Tap

In your Google Cloud Console, under "OAuth consent screen":
1. Add your domain to "Authorized domains"
2. Add your email to "Test users" if your app is in testing mode

### 5. Testing

1. Start your development server: `npm run dev`
2. Visit the login or signup page
3. You should see the Google One Tap prompt appear automatically
4. You can also click the "Continue with Google" button for traditional OAuth flow

## Components Overview

- `GoogleOneTapLogin`: Automatically prompts users to sign in with Google One Tap
- `GoogleLoginButton`: Traditional Google OAuth button
- `auth/callback/route.ts`: Handles OAuth redirects from Google

## Troubleshooting

1. **Google One Tap not appearing**: 
   - Ensure you're using a supported browser
   - Check browser console for errors
   - Make sure you're not in an incognito/private browsing window

2. **OAuth redirect issues**:
   - Verify redirect URIs are correctly configured in Google Cloud Console
   - Check that Supabase auth callback URLs are properly set

3. **Invalid Client ID errors**:
   - Double-check your Google Client ID in environment variables
   - Ensure the Client ID is for a "Web application" type

## Security Notes

- Never commit actual credentials to version control
- Use environment variables for all sensitive information
- Regularly rotate your OAuth secrets
- Monitor your Google Cloud Console for unauthorized usage