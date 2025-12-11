'use client'

import { useState } from 'react'
import { getAccount } from '@/lib/appwrite/client'

export default function PingTest() {
  const [pingResult, setPingResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const sendPing = async () => {
    setIsLoading(true)
    setError('')
    setPingResult('')
    
    try {
      const account = getAccount()
      
      // Try to get account info as a "ping" test
      const user = await account.get()
      
      setPingResult(`✅ Ping successful! Connected as: ${user.email}`)
      
    } catch (err: any) {
      // If account.get() fails, it might still mean the connection is working
      // but there's no authenticated user
      if (err.message?.includes('missing scopes') || err.code === 401) {
        setPingResult('✅ Ping successful! Connection established (no authenticated user)')
      } else {
        setError(`❌ Ping failed: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Appwrite Ping Test</h1>
        
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            Click the button below to test your Appwrite connection
          </p>
          
          <button
            onClick={sendPing}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Sending Ping...' : 'Send a ping'}
          </button>
        </div>

        {pingResult && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Result:</p>
            <p>{pingResult}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Configuration:</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Endpoint:</strong> {process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'Not set'}</p>
            <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'Not set'}</p>
            <p><strong>Database ID:</strong> {process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'Not set'}</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            This test verifies that your Appwrite client can connect to the server.
          </p>
        </div>
      </div>
    </div>
  )
}