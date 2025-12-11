'use client'

import { useState } from 'react'
import { Client } from 'appwrite'

export default function PingTestDirect() {
  const [pingResult, setPingResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const sendPing = async () => {
    setIsLoading(true)
    setError('')
    setPingResult('')
    
    try {
      // Create a direct client for ping test
      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

      // Use the client.ping() method
      const response = await client.ping()
      
      setPingResult(`✅ Ping successful! Response: ${JSON.stringify(response)}`)
      
    } catch (err: any) {
      setError(`❌ Ping failed: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Appwrite Direct Ping Test</h1>
        
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            Click the button below to send a direct ping to Appwrite
          </p>
          
          <button
            onClick={sendPing}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Pinging...' : 'Send a ping'}
          </button>
        </div>

        {pingResult && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Ping Result:</p>
            <p className="text-sm">{pingResult}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h2 className="text-lg font-semibold mb-2">How it works:</h2>
          <p className="text-sm text-gray-600">
            This test uses the Appwrite client's built-in ping() method to verify 
            connectivity to your Appwrite instance without requiring authentication.
          </p>
        </div>
      </div>
    </div>
  )
}