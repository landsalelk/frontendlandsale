// Appwrite-based API Interceptor for AI Chat
import { getAccount } from '../../../lib/appwrite/client'

export interface ApiResponse<T> {
  data: T | null
  error: Error | null
  status: number
  message: string
}

export class ApiInterceptor {
  private static instance: ApiInterceptor
  private requestQueue: Array<() => Promise<any>> = []
  private isRefreshing = false

  static getInstance(): ApiInterceptor {
    if (!ApiInterceptor.instance) {
      ApiInterceptor.instance = new ApiInterceptor()
    }
    return ApiInterceptor.instance
  }

  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    headers: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Get current session from Appwrite
      const account = getAccount()
      const session = await account.getSession('current').catch(() => null)

      if (!session) {
        throw new Error('No authentication token available')
      }

      // Add headers
      const requestHeaders = {
        ...headers,
        'Content-Type': 'application/json',
        'X-Client-Info': 'estateai-personal-agent',
      }

      // Make the request
      const response = await fetch(endpoint, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
      })

      const responseData = await response.json()

      return {
        data: responseData,
        error: null,
        status: response.status,
        message: response.statusText,
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
        status: 500,
        message: 'Internal server error',
      }
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>('GET', endpoint, undefined, headers)
  }

  async post<T>(endpoint: string, data: any, headers?: Record<string, string>) {
    return this.request<T>('POST', endpoint, data, headers)
  }

  async put<T>(endpoint: string, data: any, headers?: Record<string, string>) {
    return this.request<T>('PUT', endpoint, data, headers)
  }

  async patch<T>(endpoint: string, data: any, headers?: Record<string, string>) {
    return this.request<T>('PATCH', endpoint, data, headers)
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>('DELETE', endpoint, undefined, headers)
  }
}

export const apiInterceptor = ApiInterceptor.getInstance()

// Simplified SecureDatabaseService for Appwrite
export class SecureDatabaseService {
  private static instance: SecureDatabaseService

  static getInstance(): SecureDatabaseService {
    if (!SecureDatabaseService.instance) {
      SecureDatabaseService.instance = new SecureDatabaseService()
    }
    return SecureDatabaseService.instance
  }

  async executeSecureQuery<T>(
    table: string,
    operation: 'select' | 'insert' | 'update' | 'delete',
    options: {
      columns?: string
      filters?: Record<string, any>
      data?: any
      orderBy?: { column: string; ascending?: boolean }
      limit?: number
      offset?: number
    } = {}
  ): Promise<ApiResponse<T>> {
    // This is a stub - Appwrite uses a different query approach
    // For now, return empty response
    console.warn('SecureDatabaseService.executeSecureQuery is deprecated for Appwrite')
    return {
      data: null,
      error: new Error('Use Appwrite Databases SDK directly'),
      status: 501,
      message: 'Not implemented for Appwrite',
    }
  }

  async checkUserPermission(
    table: string,
    userId: string,
    operation: 'select' | 'insert' | 'update' | 'delete',
    resourceId?: string
  ): Promise<boolean> {
    // Appwrite handles permissions through collection-level settings
    // For now, return true and rely on Appwrite's built-in permissions
    return true
  }
}

export const secureDatabaseService = SecureDatabaseService.getInstance()