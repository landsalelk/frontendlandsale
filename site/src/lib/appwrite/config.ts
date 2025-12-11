// Client-side Appwrite configuration
// Note: The actual client initialization is done in client.ts to avoid issues during SSR/build

// Core Appwrite configuration - for server-side scripts
export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1'
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '693962bb002fb1f881bd'
export const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '' // Server-side only, not exposed to client

// Database and Collection IDs - Updated for new schema
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'osclass_landsale_db'

export const COLLECTIONS = {
    // Core listings
    LISTINGS: process.env.NEXT_PUBLIC_APPWRITE_LISTINGS_COLLECTION_ID || 'listings',
    PROPERTIES: process.env.NEXT_PUBLIC_APPWRITE_LISTINGS_COLLECTION_ID || 'listings', // Alias for compatibility
    CATEGORIES: process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID || 'categories',

    // User management
    USERS_EXTENDED: process.env.NEXT_PUBLIC_APPWRITE_USERS_EXTENDED_COLLECTION_ID || 'users_extended',
    FAVORITES: process.env.NEXT_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID || 'favorites',
    SAVED_SEARCHES: process.env.NEXT_PUBLIC_APPWRITE_SAVED_SEARCHES_COLLECTION_ID || 'saved_searches',
    USER_WALLETS: process.env.NEXT_PUBLIC_APPWRITE_USER_WALLETS_COLLECTION_ID || 'user_wallets',

    // Location hierarchy
    COUNTRIES: process.env.NEXT_PUBLIC_APPWRITE_COUNTRIES_COLLECTION_ID || 'countries',
    REGIONS: process.env.NEXT_PUBLIC_APPWRITE_REGIONS_COLLECTION_ID || 'regions',
    CITIES: process.env.NEXT_PUBLIC_APPWRITE_CITIES_COLLECTION_ID || 'cities',
    AREAS: process.env.NEXT_PUBLIC_APPWRITE_AREAS_COLLECTION_ID || 'areas',

    // Reviews and interactions
    REVIEWS: process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID || 'reviews',
    LISTING_OFFERS: process.env.NEXT_PUBLIC_APPWRITE_LISTING_OFFERS_COLLECTION_ID || 'listing_offers',

    // Content management
    CMS_PAGES: process.env.NEXT_PUBLIC_APPWRITE_CMS_PAGES_COLLECTION_ID || 'cms_pages',
    BLOG_POSTS: process.env.NEXT_PUBLIC_APPWRITE_BLOG_POSTS_COLLECTION_ID || 'blog_posts',
    FAQS: process.env.NEXT_PUBLIC_APPWRITE_FAQS_COLLECTION_ID || 'faqs',
    SEO_META: process.env.NEXT_PUBLIC_APPWRITE_SEO_META_COLLECTION_ID || 'seo_meta',
    SETTINGS: process.env.NEXT_PUBLIC_APPWRITE_SETTINGS_COLLECTION_ID || 'settings',

    // Transactions
    TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID || 'transactions',
}

// Storage bucket IDs - Updated for new schema
export const BUCKETS = {
    LISTING_IMAGES: process.env.NEXT_PUBLIC_APPWRITE_LISTING_IMAGES_BUCKET_ID || 'listing_images',
    USER_AVATARS: process.env.NEXT_PUBLIC_APPWRITE_USER_AVATARS_BUCKET_ID || 'user_avatars',
    LISTING_DOCUMENTS: process.env.NEXT_PUBLIC_APPWRITE_LISTING_DOCUMENTS_BUCKET_ID || 'listing_documents',
    BLOG_IMAGES: process.env.NEXT_PUBLIC_APPWRITE_BLOG_IMAGES_BUCKET_ID || 'blog_images',
}

// Legacy support for existing code
export const LEGACY_COLLECTIONS = {
    PROPERTIES: 'properties', // Old collection name
    FAVORITES: 'favorites',
    REGIONS: 'regions',
    CITIES: 'cities',
}