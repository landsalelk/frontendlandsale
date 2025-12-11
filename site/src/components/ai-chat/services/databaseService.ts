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

export class DatabaseService {
  private static instance: DatabaseService

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // Properties CRUD Operations
  async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResponse<Property>> {
    try {
      const databases = getDatabases()
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.LISTINGS,
        ID.unique(),
        {
          ...property,
        }
      )

      return { data: this.mapDocToProperty(doc), error: null }
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
        queries.push(Query.equal('type', filters.property_type))
      }
      if (filters?.status) {
        queries.push(Query.equal('status', filters.status))
      }
      if (filters?.price_min) {
        queries.push(Query.greaterThanEqual('price', filters.price_min))
      }
      if (filters?.price_max) {
        queries.push(Query.lessThanEqual('price', filters.price_max))
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
    return {
      id: doc.$id,
      user_id: doc.user_id,
      title: doc.title,
      description: doc.description || '',
      price: doc.price,
      location: doc.city || doc.district || '',
      property_type: doc.type || 'land',
      bedrooms: doc.bedrooms,
      bathrooms: doc.bathrooms,
      square_feet: undefined,
      images: doc.images || [],
      amenities: [],
      status: doc.status || 'available',
      created_at: doc.$createdAt,
      updated_at: doc.$updatedAt,
    }
  }
}

export const databaseService = DatabaseService.getInstance()