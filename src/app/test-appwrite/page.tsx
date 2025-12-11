import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'

export const dynamic = 'force-dynamic'

export default async function TestAppwrite() {
    let result: any = {}
    let error: any = null

    try {
        const { databases } = await createAdminClient()

        // Try to list collections
        const collections = await databases.listCollections(DATABASE_ID)
        result.collections = collections.collections.map((c: any) => ({ id: c.$id, name: c.name }))

        // Try to list properties
        try {
            const props = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LISTINGS)
            result.propertiesCount = props.total
        } catch (e: any) {
            result.propertiesError = e.message
        }

        // Try to list regions
        try {
            const regions = await databases.listDocuments(DATABASE_ID, COLLECTIONS.REGIONS)
            result.regionsCount = regions.total
        } catch (e: any) {
            result.regionsError = e.message
        }

    } catch (e: any) {
        error = {
            message: e.message,
            code: e.code,
            type: e.type
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-4">Appwrite Connection Test</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-bold">Error:</p>
                        <pre className="text-sm">{JSON.stringify(error, null, 2)}</pre>
                    </div>
                )}

                {!error && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        <p className="font-bold">Success! Connected to Appwrite</p>
                    </div>
                )}

                <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-2">Results:</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>

                <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-2">Configuration:</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                        {JSON.stringify({
                            endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
                            projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
                            databaseId: DATABASE_ID,
                            collections: COLLECTIONS,
                        }, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    )
}
