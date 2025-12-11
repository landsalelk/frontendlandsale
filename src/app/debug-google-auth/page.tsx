"use client"

import { useEffect, useState } from "react"

export default function DebugPage() {
  const [clientId, setClientId] = useState<string | undefined>(undefined)
  const [isWindowDefined, setIsWindowDefined] = useState(false)
  const [envVars, setEnvVars] = useState<any>({})

  useEffect(() => {
    // Check if we're in the browser
    setIsWindowDefined(typeof window !== "undefined")

    // Get the Google Client ID from environment
    setClientId(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

    // Log all environment variables for debugging
    console.log("All env vars:", process.env)

    // Create a copy of relevant environment variables
    setEnvVars({
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Google Auth Debug</h1>

        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-gray-700">Environment Check</h2>
            <p className="text-sm text-gray-600 mt-1">
              Window defined: <span className="font-mono">{isWindowDefined.toString()}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Google Client ID: <span className="font-mono">{clientId || "Not found"}</span>
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">All Environment Variables</h2>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
              {JSON.stringify(envVars, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">Status</h2>
            {clientId ? (
              <p className="text-green-600">✅ Google Client ID is available</p>
            ) : (
              <p className="text-red-600">❌ Google Client ID is missing</p>
            )}

            {isWindowDefined ? (
              <p className="text-green-600">✅ Running in browser environment</p>
            ) : (
              <p className="text-red-600">❌ Not running in browser environment</p>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">Next Steps</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 mt-1">
              <li>Check browser console for JavaScript errors</li>
              <li>Verify Appwrite Google OAuth is properly configured</li>
              <li>Ensure Google Cloud Console has correct redirect URIs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}