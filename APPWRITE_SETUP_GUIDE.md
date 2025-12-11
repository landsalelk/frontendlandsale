# Appwrite Manual Setup Guide for LandSale.lk

## Database Configuration
- **Database ID**: `landsale_main_db`
- **Database Name**: LandSale Main Database

## Collections to Create

### 1. Listings Collection
**Collection ID**: `listings`  
**Collection Name**: Property Listings

**Attributes**:
- `user_id` (string, 36 chars, required) - User who created the listing
- `slug` (string, 255 chars, required) - URL-friendly identifier
- `status` (string, 50 chars, required, default: 'pending') - Listing status
- `listing_type` (string, 50 chars, required, default: 'sale') - Type of listing
- `title` (string, 5000 chars, required) - Property title (JSON format)
- `description` (string, 10000 chars, required) - Property description (JSON format)
- `location` (string, 5000 chars, required) - Location data (JSON format)
- `contact` (string, 5000 chars, required) - Contact information (JSON format)
- `attributes` (string, 5000 chars, required) - Property attributes (JSON format)
- `price` (integer, required) - Price in cents
- `currency_code` (string, 10 chars, required, default: 'LKR') - Currency
- `price_negotiable` (boolean, optional, default: false) - Negotiable flag
- `features` (string array, optional) - Property features
- `images` (string array, optional) - Image URLs
- `views_count` (integer, optional, default: 0) - View counter
- `is_premium` (boolean, optional, default: false) - Premium flag
- `auction_enabled` (boolean, optional, default: false) - Auction flag
- `bid_count` (integer, optional, default: 0) - Bid counter
- `ip_address` (string, 45 chars, optional) - IP address

**Permissions**:
- Read: Any user
- Create: Authenticated users
- Update: Authenticated users (own listings)
- Delete: Authenticated users (own listings)

**Indexes**:
- `user_id_idx` on `user_id`
- `status_idx` on `status`
- `listing_type_idx` on `listing_type`
- `slug_idx` unique on `slug`
- `price_idx` on `price`

### 2. Favorites Collection
**Collection ID**: `favorites`  
**Collection Name**: User Favorites

**Attributes**:
- `user_id` (string, 36 chars, required) - User ID
- `property_id` (string, 36 chars, required) - Property ID

**Permissions**:
- Read: Authenticated users (own favorites)
- Create: Authenticated users
- Delete: Authenticated users (own favorites)

**Indexes**:
- `user_id_idx` on `user_id`
- `property_user_idx` on `property_id` + `user_id`

### 3. Regions Collection
**Collection ID**: `regions`  
**Collection Name**: Geographic Regions

**Attributes**:
- `name` (string, 100 chars, required) - Region name
- `slug` (string, 100 chars, required) - URL-friendly name
- `active` (boolean, required, default: true) - Active flag
- `legacy_id` (string, 50 chars, optional) - Legacy system ID

**Permissions**:
- Read: Any user
- Create/Update/Delete: Admin only

**Indexes**:
- `slug_idx` unique on `slug`
- `active_idx` on `active`

### 4. Cities Collection
**Collection ID**: `cities`  
**Collection Name**: Cities

**Attributes**:
- `name` (string, 100 chars, required) - City name
- `slug` (string, 100 chars, required) - URL-friendly name
- `region_id` (string, 36 chars, required) - Parent region ID
- `active` (boolean, required, default: true) - Active flag
- `legacy_id` (string, 50 chars, optional) - Legacy system ID

**Permissions**:
- Read: Any user
- Create/Update/Delete: Admin only

**Indexes**:
- `region_id_idx` on `region_id`
- `active_idx` on `active`
- `region_active_idx` on `region_id` + `active`

### 5. Additional Collections (Optional for now)

#### Users Extended
**Collection ID**: `users_extended`  
**Purpose**: Extended user profile information

#### Categories
**Collection ID**: `categories`  
**Purpose**: Property categories/types

#### Countries
**Collection ID**: `countries`  
**Purpose**: Country data

#### Areas
**Collection ID**: `areas`  
**Purpose**: Sub-city areas/neighborhoods

## Storage Buckets

### 1. Listing Images Bucket
**Bucket ID**: `listing_images`  
**Bucket Name**: Property Listing Images
- Max file size: 10MB
- Allowed formats: jpg, jpeg, png, gif, webp
- Encryption: Enabled
- Permissions: Read (any), Write (authenticated)

### 2. User Avatars Bucket
**Bucket ID**: `user_avatars`  
**Bucket Name**: User Profile Pictures
- Max file size: 5MB
- Allowed formats: jpg, jpeg, png, webp
- Encryption: Enabled
- Permissions: Read (any), Write (authenticated)

## Setup Steps Summary

1. **Create Database**: `landsale_main_db`
2. **Create Collections**: Start with listings, favorites, regions, cities
3. **Create Storage Buckets**: listing_images, user_avatars
4. **Test Connection**: Visit http://localhost:3000/test-appwrite
5. **Seed Data**: Use migration scripts if you have existing data

## Testing Your Setup

After creating the database and collections:

1. Visit: http://localhost:3000/test-appwrite
2. Check if collections are detected
3. Try creating a test listing
4. Verify permissions work correctly

## Need Help?

If you encounter issues:
1. Check Appwrite Console logs
2. Verify collection permissions
3. Test with simple operations first
4. Check browser console for JavaScript errors