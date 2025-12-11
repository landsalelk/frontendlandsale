import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/appwrite/server'

// Appwrite OAuth callback handler
// After successful OAuth login, Appwrite redirects here with session info
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const redirect = searchParams.get('redirect') ?? '/dashboard'

    try {
        // Appwrite OAuth flow:
        // 1. User clicks "Login with Google"
        // 2. Appwrite handles OAuth flow and creates a session
        // 3. Appwrite redirects back to this callback with user secret
        
        const userId = searchParams.get('userId')
        const secret = searchParams.get('secret')
        
        if (userId && secret) {
            // Create session from OAuth credentials
            const { account } = await createAdminClient()
            const session = await account.createSession(userId, secret)
            
            // Set session cookie for server-side access
            const cookieStore = await cookies()
            cookieStore.set('appwrite-session', session.secret, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            })
        }
        
        return NextResponse.redirect(`${origin}${redirect}`)
        
    } catch (error) {
        console.error('OAuth callback error:', error)
        // Redirect to login with error
        return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
    }
}
