export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            properties: {
                Row: {
                    id: string
                    user_id: string
                    type: 'land' | 'house' | 'commercial'
                    district: string
                    city: string
                    address: string | null
                    title: string
                    description: string
                    price: number
                    price_negotiable: boolean
                    size: string
                    bedrooms: number | null
                    bathrooms: number | null
                    features: string[]
                    images: string[]
                    contact_name: string
                    contact_phone: string
                    whatsapp: string | null
                    status: 'active' | 'pending' | 'sold' | 'rejected'
                    is_featured: boolean
                    views: number
                    created_at: string
                    updated_at: string
                    deleted_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: 'land' | 'house' | 'commercial'
                    district: string
                    city: string
                    address?: string | null
                    title: string
                    description: string
                    price: number
                    price_negotiable?: boolean
                    size: string
                    bedrooms?: number | null
                    bathrooms?: number | null
                    features?: string[]
                    images?: string[]
                    contact_name: string
                    contact_phone: string
                    whatsapp?: string | null
                    status?: 'active' | 'pending' | 'sold'
                    views?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: 'land' | 'house' | 'commercial'
                    district?: string
                    city?: string
                    address?: string | null
                    title?: string
                    description?: string
                    price?: number
                    price_negotiable?: boolean
                    size?: string
                    bedrooms?: number | null
                    bathrooms?: number | null
                    features?: string[]
                    images?: string[]
                    contact_name?: string
                    contact_phone?: string
                    whatsapp?: string | null
                    status?: 'active' | 'pending' | 'sold'
                    views?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            favorites: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string
                    property_id: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id: string
                    property_id: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string
                    property_id?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    phone: string | null
                    avatar_url: string | null
                    bio: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    updated_at?: string
                }
            }
            regions: {
                Row: {
                    id: number
                    name: string
                    slug: string
                    active: boolean
                    created_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    slug: string
                    active?: boolean
                    created_at?: string
                }
                Update: {
                    name?: string
                    slug?: string
                    active?: boolean
                }
            }
            cities: {
                Row: {
                    id: number
                    region_id: number
                    name: string
                    slug: string
                    active: boolean
                    created_at: string
                }
                Insert: {
                    id?: number
                    region_id: number
                    name: string
                    slug: string
                    active?: boolean
                    created_at?: string
                }
                Update: {
                    region_id?: number
                    name?: string
                    slug?: string
                    active?: boolean
                }
            }
            inquiries: {
                Row: {
                    id: string
                    created_at: string
                    property_id: string
                    sender_id: string
                    seller_id: string
                    sender_name: string
                    sender_email: string | null
                    sender_phone: string | null
                    message: string
                    is_read: boolean
                    read_at: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    property_id: string
                    sender_id: string
                    seller_id: string
                    sender_name: string
                    sender_email?: string | null
                    sender_phone?: string | null
                    message: string
                    is_read?: boolean
                    read_at?: string | null
                }
                Update: {
                    is_read?: boolean
                    read_at?: string | null
                }
            }
            property_views: {
                Row: {
                    id: string
                    property_id: string
                    viewer_id: string | null
                    ip_address: string | null
                    user_agent: string | null
                    viewed_at: string
                }
                Insert: {
                    id?: string
                    property_id: string
                    viewer_id?: string | null
                    ip_address?: string | null
                    user_agent?: string | null
                    viewed_at?: string
                }
                Update: never
            }
        }
        Functions: {
            increment_property_views: {
                Args: { property_uuid: string }
                Returns: void
            }
            soft_delete_property: {
                Args: { property_uuid: string }
                Returns: void
            }
            restore_property: {
                Args: { property_uuid: string }
                Returns: void
            }
        }
    }
}
