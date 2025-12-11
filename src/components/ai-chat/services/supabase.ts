// Appwrite client for AI chat services
import { Client, Databases, Query } from 'appwrite'
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

if (!endpoint || !projectId) {
  console.warn('Missing Appwrite environment variables')
}

const client = new Client()

if (endpoint && projectId) {
  client.setEndpoint(endpoint).setProject(projectId)
}

export const databases = new Databases(client)

// Helper functions for AI chat to query properties
export async function searchProperties(query: string, filters?: {
  type?: string
  district?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
}) {
  const queries = []

  if (filters?.type) {
    queries.push(Query.equal('type', filters.type))
  }
  if (filters?.district) {
    queries.push(Query.equal('district', filters.district))
  }
  if (filters?.city) {
    queries.push(Query.equal('city', filters.city))
  }
  if (filters?.minPrice) {
    queries.push(Query.greaterThanEqual('price', filters.minPrice))
  }
  if (filters?.maxPrice) {
    queries.push(Query.lessThanEqual('price', filters.maxPrice))
  }

  queries.push(Query.equal('status', 'active'))
  queries.push(Query.orderDesc('$createdAt'))
  queries.push(Query.limit(filters?.limit || 10))

  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PROPERTIES,
      queries
    )
    return response.documents
  } catch (error) {
    console.error('Error searching properties:', error)
    return []
  }
}

export async function getPropertyById(id: string) {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.PROPERTIES,
      id
    )
    return doc
  } catch (error) {
    console.error('Error fetching property:', error)
    return null
  }
}

export async function getRegions() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.REGIONS,
      [
        Query.equal('is_active', true),
        Query.orderAsc('name'),
        Query.limit(100)
      ]
    )
    return response.documents
  } catch (error) {
    console.error('Error fetching regions:', error)
    return []
  }
}

export async function getCitiesByRegion(regionId: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CITIES,
      [
        Query.equal('region_id', regionId),
        Query.equal('is_active', true),
        Query.orderAsc('name'),
        Query.limit(500)
      ]
    )
    return response.documents
  } catch (error) {
    console.error('Error fetching cities:', error)
    return []
  }
}