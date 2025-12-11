# Troubleshooting Google Authentication Not Showing

## Common Issues and Solutions

### 1. Environment Variables Not Loaded
Even though we can see the environment variables in the Docker container, they might not be properly exposed to the browser.

**Check:** 
- Visit `/debug-google-auth` on your website to verify if the Google Client ID is available in the browser
- Look at the browser console for any errors

### 2. JavaScript Errors Preventing Rendering
JavaScript errors might prevent the Google components from rendering.

**Check:**
- Open browser developer tools (F12)
- Look at the Console tab for any errors
- Look at the Network tab for failed requests

### 3. Supabase Google Provider Not Properly Configured
Even if you've set up the Supabase Google login API, it might not be properly configured.

**Check:**
- In your Supabase dashboard, go to Authentication > Providers
- Ensure the Google provider is enabled
- Verify the Client ID and Secret are correct
- Check that the redirect URLs are properly set

### 4. Google Cloud Console Configuration Issues
Incorrect configuration in Google Cloud Console can prevent the Google login from working.

**Check:**
- In Google Cloud Console, verify your OAuth 2.0 Client ID
- Ensure Authorized JavaScript origins include your domain
- Ensure Authorized redirect URIs include:
  - `https://your-domain.com/auth/callback`
  - `https://your-project-ref.supabase.co/auth/v1/callback`

### 5. Component Rendering Issues
The Google components might not be rendering properly due to conditional logic.

**Check:**
- Inspect the page HTML to see if Google components are in the DOM
- Look for any CSS that might be hiding the components

## Debugging Steps

### Step 1: Check Browser Environment
1. Visit your website's `/debug-google-auth` page
2. Verify that the Google Client ID is displayed
3. Check if "Running in browser environment" shows as true

### Step 2: Check Browser Console
1. Open your website's login page
2. Press F12 to open developer tools
3. Go to the Console tab
4. Look for any error messages
5. Refresh the page and watch for errors during load

### Step 3: Check Network Requests
1. With developer tools open, go to the Network tab
2. Refresh the login page
3. Look for any failed requests (shown in red)
4. Check if the Google Identity Services script loads properly:
   - Look for requests to `https://accounts.google.com/gsi/client`

### Step 4: Inspect Page Elements
1. Right-click on the login page and select "Inspect" or press Ctrl+Shift+I
2. Look for the Google login button in the HTML
3. Check if the Google One Tap container is present (it might be hidden)

### Step 5: Verify Supabase Configuration
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Click on Google to edit the configuration
4. Verify that:
   - The provider is enabled
   - Client ID matches: `937216007837-3ceut2kl020gt9gbqh8ugbfejs5ukg6d.apps.googleusercontent.com`
   - Redirect URLs include your domain and the Supabase callback URL

## Quick Fixes to Try

### 1. Restart Your Application
Sometimes a simple restart can resolve environment variable issues:
```bash
cd /srv/landsale-frontend
docker compose down
docker compose up -d
```

### 2. Force Rebuild
If restarting doesn't work, try rebuilding the containers:
```bash
cd /srv/landsale-frontend
docker compose down
docker compose up --build -d
```

### 3. Check for Ad Blockers
Some ad blockers can interfere with Google services:
- Try disabling ad blockers on your site
- Try accessing the site in an incognito/private window

### 4. Clear Browser Cache
Browser cache might be serving old versions:
- Clear your browser cache
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)

## If Issues Persist

If you've tried all the above steps and still can't see the Google login buttons:

1. Share any error messages from the browser console
2. Confirm that the debug page shows the Google Client ID is available
3. Verify your Supabase Google provider configuration
4. Check that your Google Cloud Console is properly configured

The implementation in the code is correct, so the issue is likely related to configuration rather than code.