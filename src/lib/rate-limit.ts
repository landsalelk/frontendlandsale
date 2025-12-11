/**
 * Rate Limiting Utility
 * 
 * For production use with Upstash Redis:
 * 1. Create an account at https://upstash.com
 * 2. Create a Redis database
 * 3. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local
 * 
 * For development, this provides a simple in-memory rate limiter.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'

// In-memory fallback for development
const inMemoryStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Simple in-memory rate limiter for development
 */
function inMemoryRateLimit(identifier: string, limit: number, windowMs: number) {
    const now = Date.now()
    const record = inMemoryStore.get(identifier)

    if (!record || now > record.resetTime) {
        inMemoryStore.set(identifier, { count: 1, resetTime: now + windowMs })
        return { success: true, remaining: limit - 1 }
    }

    if (record.count >= limit) {
        return { success: false, remaining: 0 }
    }

    record.count++
    return { success: true, remaining: limit - record.count }
}

/**
 * Create a rate limiter instance
 * Uses Upstash Redis in production, in-memory for development
 */
export function createRateLimiter(config: {
    requests: number
    window: '1 m' | '10 s' | '1 h' | '1 d'
}) {
    // Check if Upstash credentials are available
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

    if (upstashUrl && upstashToken) {
        // Use Upstash Redis for production
        const redis = new Redis({
            url: upstashUrl,
            token: upstashToken,
        })

        return new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(config.requests, config.window),
            analytics: true,
        })
    }

    // Return null to signal using in-memory fallback
    return null
}

/**
 * Rate limit a request
 * @param identifier - Unique identifier (usually IP or user ID)
 * @param limit - Number of requests allowed
 * @param windowMs - Time window in milliseconds
 */
export async function rateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000
) {
    const rateLimiter = createRateLimiter({ requests: limit, window: '1 m' })

    if (rateLimiter) {
        const { success, remaining, reset } = await rateLimiter.limit(identifier)
        return { success, remaining, reset }
    }

    // Fallback to in-memory
    return inMemoryRateLimit(identifier, limit, windowMs)
}

/**
 * Get IP address from request headers
 */
export async function getIPAddress(): Promise<string> {
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIP = headersList.get('x-real-ip')

    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }

    if (realIP) {
        return realIP
    }

    return 'anonymous'
}

/**
 * Rate limit auth endpoints (stricter limits)
 * 5 requests per minute for login/signup
 */
export async function rateLimitAuth() {
    const ip = await getIPAddress()
    return rateLimit(`auth:${ip}`, 5, 60000)
}

/**
 * Rate limit API endpoints (standard limits)
 * 30 requests per minute
 */
export async function rateLimitAPI() {
    const ip = await getIPAddress()
    return rateLimit(`api:${ip}`, 30, 60000)
}
