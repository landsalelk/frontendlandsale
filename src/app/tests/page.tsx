import Link from 'next/link'

export default function AppwriteTests() {
  const tests = [
    {
      name: "Simple Ping Test",
      path: "/ping-test",
      description: "Basic connection test using account validation",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      name: "Direct Ping Test", 
      path: "/ping-direct",
      description: "Direct client.ping() method test",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      name: "Complete Test Suite",
      path: "/appwrite-test", 
      description: "Comprehensive tests including ping, database, and config",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      name: "Original Test Page",
      path: "/test-appwrite",
      description: "Server-side database and collection listing",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Appwrite Connection Tests</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Choose a Test</h2>
          <p className="text-gray-600 mb-6">
            Select one of the test options below to verify your Appwrite connection. 
            Each test provides different ways to validate your setup.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {tests.map((test) => (
              <Link 
                key={test.path}
                href={test.path}
                className={`block p-6 rounded-lg text-white transition-colors duration-200 ${test.color}`}
              >
                <h3 className="text-xl font-bold mb-2">{test.name}</h3>
                <p className="text-sm opacity-90">{test.description}</p>
                <div className="mt-4 text-sm font-medium">
                  Click to run test →
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Current Configuration</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Endpoint:</p>
              <p className="text-gray-600">{process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}</p>
            </div>
            <div>
              <p className="font-medium">Project ID:</p>
              <p className="text-gray-600">{process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}</p>
            </div>
            <div>
              <p className="font-medium">Database ID:</p>
              <p className="text-gray-600">{process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}</p>
            </div>
            <div>
              <p className="font-medium">Status:</p>
              <p className="text-green-600 font-medium">✅ Configured</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}