import { createAdminClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function TestDBPage() {
    let collections: string[] = []
    let propertyFields: string[] | string = []
    let error: any = null

    try {
        const { databases } = await createAdminClient()

        // List collections by trying to access each known collection
        const collectionsToCheck = [
            { id: COLLECTIONS.LISTINGS, name: 'listings' },
            { id: COLLECTIONS.FAVORITES, name: 'favorites' },
            { id: COLLECTIONS.REGIONS, name: 'regions' },
            { id: COLLECTIONS.CITIES, name: 'cities' },
        ]

        for (const col of collectionsToCheck) {
            try {
                await databases.listDocuments(DATABASE_ID, col.id, [])
                collections.push(col.name)
            } catch {
                // Collection doesn't exist or is not accessible
            }
        }

        // Try to fetch properties to see fields
        try {
            const { documents } = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.LISTINGS,
                []
            )
            if (documents.length > 0) {
                propertyFields = Object.keys(documents[0])
            } else {
                propertyFields = "Collection empty"
            }
        } catch (e) {
            propertyFields = "Could not fetch properties"
        }
    } catch (e) {
        error = e
    }

    if (error) {
        return (
            <div className="container py-10">
                <h1 className="text-2xl font-bold text-red-500">Error Connecting to Appwrite</h1>
                <pre className="bg-slate-100 p-4 rounded mt-4">{JSON.stringify(error, null, 2)}</pre>
            </div>
        )
    }

    return (
        <div className="container py-10">
            <h1 className="text-2xl font-bold mb-6">Appwrite Database Inspection</h1>

            <div className="space-y-6">
                <div className="border p-4 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Database ID:</h2>
                    <p className="font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">{DATABASE_ID}</p>
                </div>

                <div className="border p-4 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Available Collections:</h2>
                    <ul className="list-disc pl-5">
                        {collections.map((c) => (
                            <li key={c}>{c}</li>
                        ))}
                    </ul>
                    {collections.length === 0 && <p className="text-muted-foreground">No collections found or accessible.</p>}
                </div>

                <div className="border p-4 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Fields in 'properties' (inferred from first document):</h2>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded">{JSON.stringify(propertyFields, null, 2)}</pre>
                </div>
            </div>
        </div>
    )
}
