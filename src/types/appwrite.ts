/**
 * Appwrite Collection Types
 * Generated from APPWRITE_COLLECTIONS_REFERENCE.md schema
 * Database: osclass_landsale_db
 */

import { Models } from 'appwrite'

// ============================================================================
// JSON Field Interfaces (stored as strings in Appwrite, parsed on read)
// ============================================================================

/**
 * Internationalized text field
 * @example { "en": "Beautiful House", "si": "ලස්සන නිවස" }
 */
export interface I18nField {
    en: string
    si?: string
    ta?: string
    [locale: string]: string | undefined
}

/**
 * Location data stored in listings.location
 */
export interface LocationJson {
    country: string
    country_name: string
    region: string
    city: string
    area?: string
    address?: string
    zip?: string
    lat?: number
    lng?: number
}

/**
 * Contact information stored in listings.contact
 */
export interface ContactJson {
    name: string
    email?: string
    phone?: string
    whatsapp?: string
    show_email?: boolean
    show_phone?: boolean
}

/**
 * Property attributes stored in listings.attributes
 */
export interface AttributesJson {
    bedrooms?: number
    bathrooms?: number
    size?: string
    parking?: string
    floor?: string
    age?: string
    [key: string]: string | number | boolean | undefined
}

// ============================================================================
// Enum Types
// ============================================================================

export type ListingType = 'sale' | 'rent' | 'wanted'
export type ListingStatus = 'draft' | 'pending' | 'active' | 'sold' | 'expired' | 'rejected'
export type AccountType = 'individual' | 'business' | 'agent'
export type VerificationStatus = 'unverified' | 'email_verified' | 'phone_verified' | 'id_verified'
export type TransactionType = 'premium_upgrade' | 'featured' | 'bump' | 'package' | 'listing_fee'
export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'cash'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired'
export type SearchFrequency = 'instant' | 'daily' | 'weekly'
export type BlogStatus = 'draft' | 'published' | 'archived'
export type SeoEntityType = 'listing' | 'category' | 'page' | 'user'

// ============================================================================
// Collection Document Types (extend Appwrite's Models.Document)
// ============================================================================

/**
 * Listing document (Collection: listings)
 */
export interface ListingDocument extends Models.Document {
    user_id: string
    category_id: string
    title: string // JSON: I18nField
    description: string // JSON: I18nField
    slug: string
    listing_type: ListingType
    status: ListingStatus
    price: number // In cents
    currency_code: string
    price_negotiable: boolean
    location: string // JSON: LocationJson
    contact: string // JSON: ContactJson
    attributes?: string // JSON: AttributesJson
    features?: string[]
    images?: string[]
    videos?: string[]
    is_premium: boolean
    views_count: number
    expires_at: string
    published_at?: string
    ip_address: string
    auction_enabled: boolean
    min_bid_amount?: number
    current_bid_amount?: number
    bid_count: number
    auction_ends_at?: string
    seo_title?: string // JSON: I18nField
    seo_description?: string // JSON: I18nField
    seo_keywords?: string[]
}

/**
 * Category document (Collection: categories)
 */
export interface CategoryDocument extends Models.Document {
    parent_id?: string
    name: string // JSON: I18nField
    slug: string
    description?: string // JSON: I18nField
    icon?: string
    color?: string
    position: number
    is_enabled: boolean
    price_enabled: boolean
    expiration_days: number
}

/**
 * Extended user profile (Collection: users_extended)
 */
export interface UsersExtendedDocument extends Models.Document {
    user_id: string
    username: string
    bio?: string
    avatar_file_id?: string
    account_type: AccountType
    business_info?: string // JSON
    location?: string // JSON
    phone_land?: string
    phone_mobile?: string
    website?: string
    social_links?: string // JSON
    verification_status: VerificationStatus
    is_banned: boolean
    listings_count: number
    rating_average: number
    rating_count: number
}

/**
 * Country document (Collection: countries)
 */
export interface CountryDocument extends Models.Document {
    code: string
    name: string // JSON: I18nField
    phone_code?: string
    currency_code?: string
    slug: string
    is_active: boolean
}

/**
 * Region document (Collection: regions)
 */
export interface RegionDocument extends Models.Document {
    country_code: string
    name: string // JSON: I18nField
    slug: string
    is_active: boolean
}

/**
 * City document (Collection: cities)
 */
export interface CityDocument extends Models.Document {
    region_id: string
    name: string // JSON: I18nField
    slug: string
    latitude?: number
    longitude?: number
    is_active: boolean
}

/**
 * Area document (Collection: areas)
 */
export interface AreaDocument extends Models.Document {
    city_id: string
    name: string // JSON: I18nField
    slug: string
    is_active: boolean
}

/**
 * Review document (Collection: reviews)
 */
export interface ReviewDocument extends Models.Document {
    listing_id: string
    reviewer_id: string
    seller_id: string
    rating: number
    title?: string
    comment?: string
    is_verified: boolean
    reply?: string
    is_approved: boolean
}

/**
 * Favorite document (Collection: favorites)
 */
export interface FavoriteDocument extends Models.Document {
    user_id: string
    listing_id: string
    collection_name?: string
    notes?: string
}

/**
 * Saved search document (Collection: saved_searches)
 */
export interface SavedSearchDocument extends Models.Document {
    user_id: string
    name: string
    search_params: string // JSON
    frequency: SearchFrequency
    is_active: boolean
    last_sent_at?: string
}

/**
 * CMS page document (Collection: cms_pages)
 */
export interface CmsPageDocument extends Models.Document {
    slug: string
    title: string // JSON: I18nField
    content: string // JSON: I18nField
    meta_title?: string // JSON: I18nField
    meta_description?: string // JSON: I18nField
    is_published: boolean
    position: number
}

/**
 * Settings document (Collection: settings)
 */
export interface SettingsDocument extends Models.Document {
    key: string
    value: string
    category: string
    description?: string
}

/**
 * Transaction document (Collection: transactions)
 */
export interface TransactionDocument extends Models.Document {
    user_id: string
    seller_id: string
    listing_id?: string
    transaction_type: TransactionType
    amount: number
    currency_code: string
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    payment_gateway?: string
    transaction_id?: string
    metadata?: string // JSON
    completed_at?: string
}

/**
 * User wallet document (Collection: user_wallets)
 */
export interface UserWalletDocument extends Models.Document {
    user_id: string
    balance: number
    currency_code: string
    is_active: boolean
}

/**
 * Listing offer document (Collection: listing_offers)
 */
export interface ListingOfferDocument extends Models.Document {
    listing_id: string
    buyer_id: string
    offer_amount: number
    currency_code: string
    message?: string
    status: OfferStatus
    expires_at?: string
    seller_response?: string
    responded_at?: string
}

/**
 * SEO meta document (Collection: seo_meta)
 */
export interface SeoMetaDocument extends Models.Document {
    entity_type: SeoEntityType
    entity_id: string
    meta_title?: string // JSON: I18nField
    meta_description?: string // JSON: I18nField
    meta_keywords?: string
    og_image?: string
    canonical_url?: string
    robots?: string
}

/**
 * Blog post document (Collection: blog_posts)
 */
export interface BlogPostDocument extends Models.Document {
    author_id: string
    category_id?: string
    title: string // JSON: I18nField
    slug: string
    content: string // JSON: I18nField
    excerpt?: string
    featured_image?: string
    status: BlogStatus
    published_at?: string
    views_count: number
    allow_comments: boolean
}

/**
 * FAQ document (Collection: faqs)
 */
export interface FaqDocument extends Models.Document {
    category: string
    question: string // JSON: I18nField
    answer: string // JSON: I18nField
    position: number
    is_published: boolean
    views_count: number
}

/**
 * Inquiry document (Collection: inquiries)
 * Note: This collection is used in code but not in the main schema reference
 */
export interface InquiryDocument extends Models.Document {
    property_id: string
    seller_id: string
    sender_id: string
    sender_name: string
    sender_email?: string
    sender_phone?: string
    message: string
    is_read: boolean
}

// ============================================================================
// Transformed Types (for UI compatibility with legacy format)
// ============================================================================

/**
 * Property object used by UI components (transformed from ListingDocument)
 */
export interface Property {
    $id: string
    $createdAt: string
    $updatedAt: string
    user_id: string
    title: string
    description: string
    type: 'land' | 'house' | 'commercial'
    district: string
    city: string
    address?: string
    price: number
    priceNegotiable: boolean
    size: string
    bedrooms?: number
    bathrooms?: number
    features: string[]
    images: string[]
    contactName: string
    contactPhone: string
    whatsapp?: string
    status: ListingStatus
    views: number
    is_premium: boolean
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard action result type
 */
export interface ActionResult<T = void> {
    success?: boolean
    data?: T
    error?: string
    code?: string
}

/**
 * Paginated list response
 */
export interface PaginatedResult<T> {
    documents: T[]
    total: number
    hasMore: boolean
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Parse a JSON string field safely
 */
export function parseJsonField<T>(value: string | null | undefined, fallback: T): T {
    if (!value) return fallback
    try {
        return JSON.parse(value) as T
    } catch {
        return fallback
    }
}

/**
 * Get localized text from I18nField
 */
export function getLocalizedText(field: string | null | undefined, locale: string = 'en'): string {
    const parsed = parseJsonField<I18nField>(field, { en: '' })
    return parsed[locale] || parsed.en || ''
}
