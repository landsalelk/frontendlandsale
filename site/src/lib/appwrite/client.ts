// Browser-side Appwrite client for use in Client Components
'use client'

import { Client, Account, Databases, Storage } from 'appwrite'

let client: Client | null = null
let account: Account | null = null
let databases: Databases | null = null
let storage: Storage | null = null

function getClient() {
    if (typeof window === 'undefined') {
        // Return a placeholder during SSR - actual client will be created on client side
        throw new Error('Appwrite client can only be used in browser context')
    }

    if (!client) {
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

        if (!endpoint || !projectId) {
            throw new Error('Appwrite configuration is missing. Please check environment variables.')
        }

        client = new Client()
            .setEndpoint(endpoint)
            .setProject(projectId)
    }
    return client
}

export function getAccount() {
    if (!account) {
        account = new Account(getClient())
    }
    return account
}

export function getDatabases() {
    if (!databases) {
        databases = new Databases(getClient())
    }
    return databases
}

export function getStorage() {
    if (!storage) {
        storage = new Storage(getClient())
    }
    return storage
}

/**
 * Validate current session on client side
 */
export async function validateSession() {
    try {
        const account = getAccount()
        const user = await account.get()
        return { valid: true, user }
    } catch (error) {
        return { valid: false, user: null }
    }
}

// Re-export collection IDs for client use
export { DATABASE_ID, COLLECTIONS, BUCKETS } from './config'
