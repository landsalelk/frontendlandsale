'use client'

import { useState, useEffect } from 'react'
import { Client } from 'appwrite'

export default function TestAppwriteClient() {
    const [results, setResults] = useState<any>({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        async function testConnection() {
            try {
                setIsLoading(true)
                setError('')
                
                console.log('Starting client-side Appwrite tests...')
                
                const result: any = {}
                
                // Test 1: Basic client creation
                try {
                    const client = new Client()
                        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
                        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
                    
                    result.clientCreated = true
                    console.log('✅ Client created successfully')
                } catch (err: any) {
                    result.clientCreated = false
                    result.clientError = err.message
                    console.error('❌ Client creation failed:', err.message)
                }
                
                // Test 2: Direct ping
                try {
                    const client = new Client()
                        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
                        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
                    
                    const pingResponse = await client.ping()
                    result.pingResponse = pingResponse
                    result.pingSuccess = true
                    console.log('✅ Ping successful:', pingResponse)
                } catch (err: any) {
                    result.pingSuccess = false
                    result.pingError = err.message
                    console.error('❌ Ping failed:', err.message)
                }
                
                // Test 3: Account info (if user is logged in)
                try {
                    const { getAccount } = await import('@/lib/appwrite/client')
                    const account = getAccount()
                    const user = await account.get()
                    result.user = {
                        id: user.$id,
                        email: user.email,
                        name: user.name
                    }
                    result.userAuthenticated = true
                    console.log('✅ User authenticated:', user.email)
                } catch (err: any) {
                    result.userAuthenticated = false
                    result.userError = err.message
                    console.log('ℹ️ User not authenticated or error:', err.message)
                }
                
                // Test 4: Basic database functionality (simplified test)
                try {
                    const { getDatabases } = await import('@/lib/appwrite/client')
                    const databases = getDatabases()
                    
                    // Just verify we can create the databases instance
                    result.databaseAccessible = true
                    result.databaseInstanceCreated = true
                    console.log(`✅ Database instance created successfully`)
                } catch (err: any) {
                    result.databaseAccessible = false
                    result.databaseInstanceCreated = false
                    result.databaseError = err.message
                    console.log('ℹ️ Database not accessible:', err.message)
                }
                
                setResults(result)
                
            } catch (err: any) {
                console.error('❌ Overall test failed:', err.message)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }
        
        testConnection()
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-3xl font-bold mb-6">Appwrite Connection Test</h1>
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Testing connection...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold mb-6">Appwrite Connection Test</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-bold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Connection Status */}
                <div className={`mb-6 p-4 rounded-lg ${
                    results.pingSuccess ? 'bg-green-100 border border-green-400 text-green-700' :
                    'bg-red-100 border border-red-400 text-red-700'
                }`}>
                    <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
                    {results.pingSuccess && (
                        <p>✅ Successfully connected to Appwrite!</p>
                    )}
                    {!results.pingSuccess && (
                        <p>❌ Connection failed. Check the results below for details.</p>
                    )}
                </div>

                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">Test Results</h3>
                    <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                        <pre className="text-sm">
                            {JSON.stringify(results, null, 2)}
                        </pre>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">Configuration</h3>
                    <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                        <pre className="text-xs">
                            {JSON.stringify({
                                endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
                                projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
                                databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
                            }, null, 2)}
                        </pre>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">What this test shows</h3>
                    <ul className="text-blue-700 space-y-1 text-sm">
                        <li>• <strong>Client Creation:</strong> Whether the Appwrite client can be initialized</li>
                        <li>• <strong>Ping Test:</strong> Direct connectivity to your Appwrite instance</li>
                        <li>• <strong>User Authentication:</strong> Whether a user is currently logged in</li>
                        <li>• <strong>Database Instance:</strong> Whether the databases service can be created</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}