// Appwrite-based Database Service for AI Chat
import { getDatabases, getStorage, DATABASE_ID, COLLECTIONS, BUCKETS } from '../../../lib/appwrite/client'
import { Query, ID } from 'appwrite'

export interface Property {
  id: string
  user_id: string
  title: string
  description: string
  price: number
  location: string
  property_type: 'house' | 'apartment' | 'condo' | 'townhouse' | 'land'
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  images: string[]
  amenities: string[]
  status: 'available' | 'sold' | 'pending' | 'off_market'
  created_at: string
  updated_at: string
}

// Interface matching the actual Appwrite listings schema
export interface ListingDocument {
  title: string           // JSON: {"en": "title text"}
  description: string     // JSON: {"en": "description text"}
  listing_type: string    // "sale" | "rent"
  price: number           // Price in cents (multiply by 100)
  location: string        // JSON: {"region": "district", "city": "city", "address": "address"}
  contact: string         // JSON: {"name": "name", "phone": "phone", "whatsapp": "whatsapp"}
  attributes: string      // JSON: {"size": "25 perches", "bedrooms": 0, "bathrooms": 0}
  images: string[]        // Array of image paths
  features: string[]      // Array of feature strings
  status: string          // "active" | "sold" | "pending"
  user_id: string
  views_count?: number
  price_negotiable?: boolean
  is_featured?: boolean
}

export interface ChatMessage {
  id: string
  user_id: string
  conversation_id: string
  message: string
  sender: 'user' | 'agent'
  metadata?: Record<string, any>
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  property_id?: string
  title: string
  status: 'active' | 'archived' | 'closed'
  created_at: string
  updated_at: string
}

export interface DatabaseResponse<T> {
  data: T | null
  error: Error | null
  count?: number
}

export interface CreateListingInput {
  title: string
  description: string
  property_type: 'house' | 'apartment' | 'condo' | 'townhouse' | 'land'
  price: number
  district?: string
  city?: string
  address?: string
  land_size?: number
  land_unit?: string
  bedrooms?: number
  bathrooms?: number
  features: string[]
  images: string[]
  contact_name?: string
  contact_phone?: string
  contact_whatsapp?: string
  user_id: string
}

export class DatabaseService {
  private static instance: DatabaseService

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // Create a listing in the correct Appwrite schema format
  async createListing(input: CreateListingInput): Promise<DatabaseResponse<{ id: string; url: string }>> {
    try {
      const databases = getDatabases()

      // Format title as JSON
      const titleJson = JSON.stringify({ en: input.title })

      // Format description as JSON
      const descriptionJson = JSON.stringify({ en: input.description })

      // Format location as JSON
      const locationJson = JSON.stringify({
        region: input.district || '',
        city: input.city || '',
        address: input.address || ''
      })

      // Format contact as JSON
      const contactJson = JSON.stringify({
        name: input.contact_name || '',
        phone: input.contact_phone || '',
        whatsapp: input.contact_whatsapp || input.contact_phone || ''
      })

      // Format attributes as JSON
      const sizeStr = input.land_size
        ? `${input.land_size} ${input.land_unit || 'perches'}`
        : ''
      const attributesJson = JSON.stringify({
        size: sizeStr,
        bedrooms: input.bedrooms || 0,
        bathrooms: input.bathrooms || 0
      })

      // Convert price to cents
      const priceInCents = Math.round(input.price * 100)

      // Map property type to listing type
      const listingType = 'sale' // All AI chat listings are for sale

      const documentData: Partial<ListingDocument> = {
        title: titleJson,
        description: descriptionJson,
        listing_type: listingType,
        price: priceInCents,
        location: locationJson,
        contact: contactJson,
        attributes: attributesJson,
        images: input.images || [],
        features: input.features || [],
        status: 'active',
        user_id: input.user_id,
        views_count: 0,
        price_negotiable: true,
        is_featured: false
      }

      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.LISTINGS,
        ID.unique(),
        documentData
      )

      return {
        data: {
          id: doc.$id,
          url: `/properties/${doc.$id}`
        },
        error: null
      }
    } catch (error) {
      console.error('Error creating listing:', error)
      return { data: null, error: error as Error }
    }
  }

  // Properties CRUD Operations (legacy - keeping for compatibility)
  async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResponse<Property>> {
    try {
      // Use the new createListing method internally
      const result = await this.createListing({
        title: property.title,
        description: property.description,
        property_type: property.property_type,
        price: property.price,
        city: property.location,
        features: property.amenities || [],
        images: property.images || [],
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        user_id: property.user_id
      })

      if (result.error) {
        return { data: null, error: result.error }
      }

      // Return a mock property object
      return {
        data: {
          ...property,
          id: result.data!.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getProperty(id: string): Promise<DatabaseResponse<Property>> {
    try {
      const databases = getDatabases()
      const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.LISTINGS, id)
      return { data: this.mapDocToProperty(doc), error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async getProperties(filters?: {
    user_id?: string
    property_type?: string
    status?: string
    price_min?: number
    price_max?: number
    location?: string
    limit?: number
    offset?: number
  }): Promise<DatabaseResponse<Property[]>> {
    try {
      const databases = getDatabases()
      const queries: string[] = []

      if (filters?.user_id) {
        queries.push(Query.equal('user_id', filters.user_id))
      }
      if (filters?.property_type) {
        queries.push(Query.equal('listing_type', filters.property_type))
      }
      if (filters?.status) {
        queries.push(Query.equal('status', filters.status))
      }
      if (filters?.price_min) {
        queries.push(Query.greaterThanEqual('price', filters.price_min * 100))
      }
      if (filters?.price_max) {
        queries.push(Query.lessThanEqual('price', filters.price_max * 100))
      }
      if (filters?.limit) {
        queries.push(Query.limit(filters.limit))
      }
      if (filters?.offset) {
        queries.push(Query.offset(filters.offset))
      }

      queries.push(Query.orderDesc('$createdAt'))

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROPERTIES, queries)

      return {
        data: response.documents.map(doc => this.mapDocToProperty(doc)),
        error: null,
        count: response.total
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async updateProperty(id: string, updates: Partial<Omit<Property, 'id' | 'user_id' | 'created_at'>>): Promise<DatabaseResponse<Property>> {
    try {
      const databases = getDatabases()
      const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROPERTIES, id, updates)
      return { data: this.mapDocToProperty(doc), error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async deleteProperty(id: string): Promise<DatabaseResponse<boolean>> {
    try {
      const databases = getDatabases()
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PROPERTIES, id)
      return { data: true, error: null }
    } catch (error) {
      return { data: false, error: error as Error }
    }
  }

  // Conversations - Stub implementations (would need new collections)
  async createConversation(conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResponse<Conversation>> {
    console.warn('Conversation features need Appwrite collections setup')
    return { data: null, error: new Error('Not implemented - needs Appwrite collections') }
  }

  async getConversations(userId: string): Promise<DatabaseResponse<Conversation[]>> {
    console.warn('Conversation features need Appwrite collections setup')
    return { data: [], error: null }
  }

  async updateConversation(id: string, updates: Partial<Omit<Conversation, 'id' | 'user_id' | 'created_at'>>): Promise<DatabaseResponse<Conversation>> {
    console.warn('Conversation features need Appwrite collections setup')
    return { data: null, error: new Error('Not implemented - needs Appwrite collections') }
  }

  // Chat Messages - Stub implementations
  async createMessage(message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<DatabaseResponse<ChatMessage>> {
    console.warn('Chat message features need Appwrite collections setup')
    return { data: null, error: new Error('Not implemented - needs Appwrite collections') }
  }

  async getMessages(conversationId: string, limit = 50): Promise<DatabaseResponse<ChatMessage[]>> {
    console.warn('Chat message features need Appwrite collections setup')
    return { data: [], error: null }
  }

  // Real-time subscriptions (Appwrite uses different approach)
  subscribeToMessages(conversationId: string, callback: (message: ChatMessage) => void) {
    // Appwrite uses realtime.subscribe() differently
    // For now, return a mock subscription
    console.warn('Real-time subscriptions need Appwrite Realtime setup')
    return {
      unsubscribe: () => { }
    }
  }

  subscribeToPropertyUpdates(userId: string, callback: (property: Property) => void) {
    console.warn('Real-time subscriptions need Appwrite Realtime setup')
    return {
      unsubscribe: () => { }
    }
  }

  // Utility methods
  async uploadImage(file: File, bucket: string = BUCKETS.LISTING_IMAGES): Promise<DatabaseResponse<string>> {
    try {
      const storage = getStorage()
      const response = await storage.createFile(bucket, ID.unique(), file)

      // Get file view URL
      const url = storage.getFileView(bucket, response.$id)

      return { data: url.toString(), error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async deleteImage(fileId: string, bucket: string = BUCKETS.LISTING_IMAGES): Promise<DatabaseResponse<boolean>> {
    try {
      const storage = getStorage()
      await storage.deleteFile(bucket, fileId)
      return { data: true, error: null }
    } catch (error) {
      return { data: false, error: error as Error }
    }
  }

  // Helper to map Appwrite document to Property type
  private mapDocToProperty(doc: any): Property {
    // Parse JSON fields
    let title = ''
    let description = ''
    let location: any = {}

    try {
      if (typeof doc.title === 'string' && doc.title) {
        const parsed = JSON.parse(doc.title)
        title = parsed?.en || ''
      }
    } catch { title = doc.title || '' }

    try {
      if (typeof doc.description === 'string' && doc.description) {
        const parsed = JSON.parse(doc.description)
        description = parsed?.en || ''
      }
    } catch { description = doc.description || '' }

    try {
      if (typeof doc.location === 'string' && doc.location) {
        location = JSON.parse(doc.location)
      }
    } catch { /* ignore */ }

    return {
      id: doc.$id,
      user_id: doc.user_id,
      title: title || doc.title || '',
      description: description || doc.description || '',
      price: doc.price ? doc.price / 100 : 0, // Convert from cents
      location: location?.city || location?.region || '',
      property_type: doc.listing_type === 'sale' ? 'land' : doc.listing_type || 'land',
      bedrooms: undefined,
      bathrooms: undefined,
      square_feet: undefined,
      images: doc.images || [],
      amenities: doc.features || [],
      status: doc.status === 'active' ? 'available' : doc.status || 'available',
      created_at: doc.$createdAt,
      updated_at: doc.$updatedAt,
    }
  }
}

export const databaseService = DatabaseService.getInstance()