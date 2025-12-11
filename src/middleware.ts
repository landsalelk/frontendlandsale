import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Appwrite handles sessions via the 'appwrite-session' cookie
    // Unlike Supabase, we don't need to refresh tokens server-side in middleware
    // The session cookie is automatically sent with requests

    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Optional: Protect dashboard routes
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')
    const sessionCookie = request.cookies.get('appwrite-session')

    if (isProtectedRoute && !sessionCookie) {
        // Redirect to login if trying to access protected route without session
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
