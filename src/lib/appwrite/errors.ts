/**
 * Appwrite Error Handling Utilities
 * Centralized error handling for all Appwrite operations
 */

import { AppwriteException } from 'appwrite'

// ============================================================================
// Error Code Constants
// ============================================================================

export const AppwriteErrorCodes = {
    // Authentication errors
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,

    // Not found
    NOT_FOUND: 404,

    // Validation errors
    BAD_REQUEST: 400,
    CONFLICT: 409, // Document already exists

    // Rate limiting
    TOO_MANY_REQUESTS: 429,

    // Server errors
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const

// ============================================================================
// Error Types
// ============================================================================

export interface AppwriteErrorDetails {
    code: number
    message: string
    type: string
    isRetryable: boolean
    userMessage: string
}

export type ErrorCode =
    | 'UNAUTHENTICATED'
    | 'UNAUTHORIZED'
    | 'NOT_FOUND'
    | 'VALIDATION_ERROR'
    | 'CONFLICT'
    | 'RATE_LIMITED'
    | 'SERVER_ERROR'
    | 'NETWORK_ERROR'
    | 'UNKNOWN'

// ============================================================================
// User-Friendly Messages
// ============================================================================

const userMessages: Record<ErrorCode, string> = {
    UNAUTHENTICATED: 'Please log in to continue.',
    UNAUTHORIZED: 'You don\'t have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    CONFLICT: 'This item already exists.',
    RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
    SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
    UNKNOWN: 'An unexpected error occurred. Please try again.',
}

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Classify an error into a standardized error code
 */
export function classifyError(error: unknown): ErrorCode {
    if (error instanceof AppwriteException) {
        switch (error.code) {
            case 401:
                return 'UNAUTHENTICATED'
            case 403:
                return 'UNAUTHORIZED'
            case 404:
                return 'NOT_FOUND'
            case 400:
                return 'VALIDATION_ERROR'
            case 409:
                return 'CONFLICT'
            case 429:
                return 'RATE_LIMITED'
            case 500:
            case 502:
            case 503:
            case 504:
                return 'SERVER_ERROR'
            default:
                return 'UNKNOWN'
        }
    }

    // Check for network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return 'NETWORK_ERROR'
    }

    return 'UNKNOWN'
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
    const code = classifyError(error)
    return ['RATE_LIMITED', 'SERVER_ERROR', 'NETWORK_ERROR'].includes(code)
}

// ============================================================================
// Error Handler
// ============================================================================

/**
 * Parse and handle an Appwrite error, returning structured error details
 */
export function handleAppwriteError(error: unknown): AppwriteErrorDetails {
    const errorCode = classifyError(error)

    if (error instanceof AppwriteException) {
        return {
            code: error.code || 0,
            message: error.message,
            type: errorCode,
            isRetryable: isRetryableError(error),
            userMessage: userMessages[errorCode],
        }
    }

    if (error instanceof Error) {
        return {
            code: 0,
            message: error.message,
            type: errorCode,
            isRetryable: isRetryableError(error),
            userMessage: userMessages[errorCode],
        }
    }

    return {
        code: 0,
        message: String(error),
        type: 'UNKNOWN',
        isRetryable: false,
        userMessage: userMessages.UNKNOWN,
    }
}

// ============================================================================
// Retry Logic
// ============================================================================

interface RetryOptions {
    maxRetries?: number
    baseDelayMs?: number
    maxDelayMs?: number
}

/**
 * Execute an async operation with retry logic for transient failures
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = 3,
        baseDelayMs = 1000,
        maxDelayMs = 10000
    } = options

    let lastError: unknown

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation()
        } catch (error) {
            lastError = error

            if (!isRetryableError(error) || attempt === maxRetries) {
                throw error
            }

            // Exponential backoff with jitter
            const delay = Math.min(
                baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
                maxDelayMs
            )

            console.warn(`Retrying operation after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }

    throw lastError
}

// ============================================================================
// Action Result Helpers
// ============================================================================

export interface ActionResult<T = void> {
    success?: boolean
    data?: T
    error?: string
    errorCode?: ErrorCode
}

/**
 * Create a success result
 */
export function success<T>(data?: T): ActionResult<T> {
    return { success: true, data }
}

/**
 * Create an error result from an exception
 */
export function failure(error: unknown): ActionResult<never> {
    const details = handleAppwriteError(error)
    console.error(`[Appwrite Error] ${details.type}: ${details.message}`)

    return {
        success: false,
        error: details.userMessage,
        errorCode: details.type as ErrorCode,
    }
}

/**
 * Create an error result with a custom message
 */
export function failureWithMessage(message: string, code: ErrorCode = 'UNKNOWN'): ActionResult<never> {
    return {
        success: false,
        error: message,
        errorCode: code,
    }
}
