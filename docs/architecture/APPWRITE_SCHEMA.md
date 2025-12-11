# Appwrite Collections - Complete Schema Reference

**Database**: `osclass_landsale_db` (LandSale OSClass Migration)  
**Total Collections**: 18 (12 Core + 6 Plugin-Inspired)  
**Storage Buckets**: 4

---

## Collection 1: listings

**ID**: `listings`  
**Name**: Listings  
**Purpose**: Property/classified ad listings with multilingual support

### Attributes

| Field | Type | Size/Values | Required | Default | Array | Description |
|-------|------|-------------|----------|---------|-------|-------------|
| user_id | string | 36 | ✅ | - | ❌ | Owner (Appwrite Auth user ID) |
| category_id | string | 36 | ✅ | - | ❌ | Reference to categories collection |
| title | string | 5000 | ✅ | - | ❌ | JSON: `{"en":"House","si":"ගෙදර"}` |
| description | string | 20000 | ✅ | - | ❌ | JSON: Detailed description (i18n) |
| slug | string | 200 | ✅ | - | ❌ | URL-friendly identifier (unique) |
| listing_type | enum | sale, rent, wanted | ✅ | sale | ❌ | Type of listing |
| status | enum | draft, pending, active, sold, expired, rejected | ✅ | pending | ❌ | Current status |
| price | integer | - | ✅ | - | ❌ | Price in cents (LKR) |
| currency_code | string | 3 | ✅ | LKR | ❌ | Currency code |
| price_negotiable | boolean | - | ❌ | false | ❌ | Price is negotiable |
| location | string | 5000 | ✅ | - | ❌ | JSON: `{country, region, city, area, address, lat, lng}` |
| contact | string | 2000 | ✅ | - | ❌ | JSON: `{name, email, phone, whatsapp, show_email, show_phone}` |
| attributes | string | 10000 | ❌ | - | ❌ | JSON: Custom fields `{bedrooms:3, bathrooms:2, size:"2000 sqft"}` |
| features | string | 100 | ❌ | - | ✅ | Array: ["parking", "pool", "garden"] |
| images | string | 255 | ❌ | - | ✅ | Array: File IDs from storage |
| videos | string | 255 | ❌ | - | ✅ | Array: YouTube URLs or file IDs |
| is_premium | boolean | - | ❌ | false | ❌ | Premium/featured listing |
| views_count | integer | - | ❌ | 0 | ❌ | Page view count |
| expires_at | datetime | - | ✅ | - | ❌ | Listing expiration date |
| published_at | datetime | - | ❌ | - | ❌ | When made public |
| ip_address | string | 64 | ✅ | - | ❌ | Creator IP address |
| auction_enabled | boolean | - | ❌ | false | ❌ | Enable bidding/auction |
| min_bid_amount | integer | - | ❌ | - | ❌ | Minimum bid (if auction) |
| current_bid_amount | integer | - | ❌ | - | ❌ | Highest current bid |
| bid_count | integer | - | ❌ | 0 | ❌ | Number of bids |
| auction_ends_at | datetime | - | ❌ | - | ❌ | Auction end time |
| seo_title | string | 2000 | ❌ | - | ❌ | JSON: SEO meta title (i18n) |
| seo_description | string | 2000 | ❌ | - | ❌ | JSON: SEO meta description |
| seo_keywords | string | 100 | ❌ | - | ✅ | Array: SEO keywords |

### Indexes

| Name | Type | Attributes | Order |
|------|------|-----------|-------|
| status_idx | key | status | ASC |
| user_id_idx | key | user_id | ASC |
| category_id_idx | key | category_id | ASC |
| slug_idx | unique | slug | ASC |

### Permissions

- **Read**: Any (public)
- **Create**: Users (authenticated)
- **Update**: Users (document owner)
- **Delete**: Users (document owner)

---

## Collection 2: categories

**ID**: `categories`  
**Name**: Categories  
**Purpose**: Hierarchical listing categories

### Attributes

| Field | Type | Size/Values | Required | Default | Array |
|-------|------|-------------|----------|---------|-------|
| parent_id | string | 36 | ❌ | - | ❌ |
| name | string | 2000 | ✅ | - | ❌ |
| slug | string | 100 | ✅ | - | ❌ |
| description | string | 5000 | ❌ | - | ❌ |
| icon | string | 255 | ❌ | - | ❌ |
| color | string | 20 | ❌ | - | ❌ |
| position | integer | - | ❌ | 0 | ❌ |
| is_enabled | boolean | - | ✅ | true | ❌ |
| price_enabled | boolean | - | ✅ | true | ❌ |
| expiration_days | integer | - | ✅ | 30 | ❌ |

### Indexes

| Name | Type | Attributes | Order |
|------|------|-----------|-------|
| slug_idx | unique | slug | ASC |
| parent_id_idx | key | parent_id | ASC |

---

## Collection 3: users_extended

**ID**: `users_extended`  
**Name**: Users Extended  
**Purpose**: Additional user profile data (Appwrite Auth handles core auth)

### Attributes

| Field | Type | Size/Values | Required | Default | Array |
|-------|------|-------------|----------|---------|-------|
| user_id | string | 36 | ✅ | - | ❌ |
| username | string | 100 | ✅ | - | ❌ |
| bio | string | 2000 | ❌ | - | ❌ |
| avatar_file_id | string | 255 | ❌ | - | ❌ |
| account_type | enum | individual, business, agent | ✅ | individual | ❌ |
| business_info | string | 2000 | ❌ | - | ❌ |
| location | string | 2000 | ❌ | - | ❌ |
| phone_land | string | 45 | ❌ | - | ❌ |
| phone_mobile | string | 45 | ❌ | - | ❌ |
| website | string | 200 | ❌ | - | ❌ |
| social_links | string | 1000 | ❌ | - | ❌ |
| verification_status | enum | unverified, email_verified, phone_verified, id_verified | ✅ | unverified | ❌ |
| is_banned | boolean | - | ❌ | false | ❌ |
| listings_count | integer | - | ❌ | 0 | ❌ |
| rating_average | float | - | ❌ | 0 | ❌ |
| rating_count | integer | - | ❌ | 0 | ❌ |

### Indexes

| Name | Type | Attributes | Order |
|------|------|-----------|-------|
| user_id_idx | unique | user_id | ASC |
| username_idx | unique | username | ASC |

### Permissions

- **Document Security**: Enabled (owner-only access)

---

## Collection 4: countries

**ID**: `countries`  
**Name**: Countries

### Attributes

| Field | Type | Size | Required | Default |
|-------|------|------|----------|---------|
| code | string | 2 | ✅ | - |
| name | string | 1000 | ✅ | - |
| phone_code | string | 10 | ❌ | - |
| currency_code | string | 3 | ❌ | - |
| slug | string | 100 | ✅ | - |
| is_active | boolean | - | ✅ | true |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| code_idx | unique | code |

---

## Collection 5: regions

**ID**: `regions`  
**Name**: Regions

### Attributes

| Field | Type | Size | Required | Default |
|-------|------|------|----------|---------|
| country_code | string | 2 | ✅ | - |
| name | string | 1000 | ✅ | - |
| slug | string | 100 | ✅ | - |
| is_active | boolean | - | ✅ | true |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| slug_idx | unique | slug |

---

## Collection 6: cities

**ID**: `cities`  
**Name**: Cities

### Attributes

| Field | Type | Size | Required | Default |
|-------|------|------|----------|---------|
| region_id | string | 36 | ✅ | - |
| name | string | 1000 | ✅ | - |
| slug | string | 100 | ✅ | - |
| latitude | float | - | ❌ | - |
| longitude | float | - | ❌ | - |
| is_active | boolean | - | ✅ | true |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| slug_idx | unique | slug |
| region_id_idx | key | region_id |

---

## Collection 7: areas

**ID**: `areas`  
**Name**: Areas

### Attributes

| Field | Type | Size | Required | Default |
|-------|------|------|----------|---------|
| city_id | string | 36 | ✅ | - |
| name | string | 1000 | ✅ | - |
| slug | string | 100 | ✅ | - |
| is_active | boolean | - | ✅ | true |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| slug_idx | unique | slug |
| city_id_idx | key | city_id |

---

## Collection 8: reviews

**ID**: `reviews`  
**Name**: Reviews

### Attributes

| Field | Type | Size | Required | Default |
|-------|------|------|----------|---------|
| listing_id | string | 36 | ✅ | - |
| reviewer_id | string | 36 | ✅ | - |
| seller_id | string | 36 | ✅ | - |
| rating | integer | - | ✅ | - |
| title | string | 200 | ❌ | - |
| comment | string | 2000 | ❌ | - |
| is_verified | boolean | - | ❌ | false |
| reply | string | 2000 | ❌ | - |
| is_approved | boolean | - | ✅ | false |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| listing_id_idx | key | listing_id |
| seller_id_idx | key | seller_id |

---

## Collection 9: favorites

**ID**: `favorites`  
**Name**: Favorites

### Attributes

| Field | Type | Size | Required |
|-------|------|------|----------|
| user_id | string | 36 | ✅ |
| listing_id | string | 36 | ✅ |
| collection_name | string | 100 | ❌ |
| notes | string | 500 | ❌ |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| user_id_idx | key | user_id |
| user_listing_idx | unique | user_id, listing_id |

---

## Collection 10: saved_searches

**ID**: `saved_searches`  
**Name**: Saved Searches

### Attributes

| Field | Type | Size/Values | Required | Default |
|-------|------|-------------|----------|---------|
| user_id | string | 36 | ✅ | - |
| name | string | 100 | ✅ | - |
| search_params | string | 5000 | ✅ | - |
| frequency | enum | instant, daily, weekly | ✅ | daily |
| is_active | boolean | - | ✅ | true |
| last_sent_at | datetime | - | ❌ | - |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| user_id_idx | key | user_id |

---

## Collection 11: cms_pages

**ID**: `cms_pages`  
**Name**: CMS Pages

### Attributes

| Field | Type | Size | Required | Default |
|-------|------|------|----------|---------|
| slug | string | 100 | ✅ | - |
| title | string | 2000 | ✅ | - |
| content | string | 50000 | ✅ | - |
| meta_title | string | 2000 | ❌ | - |
| meta_description | string | 2000 | ❌ | - |
| is_published | boolean | - | ✅ | true |
| position | integer | - | ❌ | 0 |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| slug_idx | unique | slug |

---

## Collection 12: settings

**ID**: `settings`  
**Name**: Settings

### Attributes

| Field | Type | Size | Required |
|-------|------|------|----------|
| key | string | 100 | ✅ |
| value | string | 10000 | ✅ |
| category | string | 50 | ✅ |
| description | string | 500 | ❌ |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| key_idx | unique | key |
| category_idx | key | category |

---

## Collection 13: transactions

**ID**: `transactions`  
**Name**: Transactions  
**Purpose**: Payment/order tracking (from OSPay plugin)

### Attributes

| Field | Type | Size/Values | Required | Default |
|-------|------|-------------|----------|---------|
| user_id | string | 36 | ✅ | - |
| seller_id | string | 36 | ✅ | - |
| listing_id | string | 36 | ❌ | - |
| transaction_type | enum | premium_upgrade, featured, bump, package, listing_fee | ✅ | - |
| amount | integer | - | ✅ | - |
| currency_code | string | 3 | ✅ | LKR |
| payment_method | enum | card, bank_transfer, wallet, cash | ✅ | - |
| payment_status | enum | pending, completed, failed, refunded | ✅ | pending |
| payment_gateway | string | 50 | ❌ | - |
| transaction_id | string | 100 | ❌ | - |
| metadata | string | 5000 | ❌ | - |
| completed_at | datetime | - | ❌ | - |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| user_id_idx | key | user_id |
| status_idx | key | payment_status |

---

## Collection 14: user_wallets

**ID**: `user_wallets`  
**Name**: User Wallets  
**Purpose**: User credit/wallet system

### Attributes

| Field | Type | Size | Required | Default |
|-------|------|------|----------|---------|
| user_id | string | 36 | ✅ | - |
| balance | integer | - | ✅ | 0 |
| currency_code | string | 3 | ✅ | LKR |
| is_active | boolean | - | ✅ | true |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| user_id_idx | unique | user_id |

---

## Collection 15: listing_offers

**ID**: `listing_offers`  
**Name**: Listing Offers  
**Purpose**: Buyer offers/bids (from Auction plugin)

### Attributes

| Field | Type | Size/Values | Required | Default |
|-------|------|-------------|----------|---------|
| listing_id | string | 36 | ✅ | - |
| buyer_id | string | 36 | ✅ | - |
| offer_amount | integer | - | ✅ | - |
| currency_code | string | 3 | ✅ | LKR |
| message | string | 1000 | ❌ | - |
| status | enum | pending, accepted, rejected, countered, expired | ✅ | pending |
| expires_at | datetime | - | ❌ | - |
| seller_response | string | 500 | ❌ | - |
| responded_at | datetime | - | ❌ | - |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| listing_id_idx | key | listing_id |
| buyer_id_idx | key | buyer_id |
| status_idx | key | status |

---

## Collection 16: seo_meta

**ID**: `seo_meta`  
**Name**: SEO Meta  
**Purpose**: SEO metadata for any entity

### Attributes

| Field | Type | Size/Values | Required |
|-------|------|-------------|----------|
| entity_type | enum | listing, category, page, user | ✅ |
| entity_id | string | 36 | ✅ |
| meta_title | string | 2000 | ❌ |
| meta_description | string | 2000 | ❌ |
| meta_keywords | string | 100 | ❌ |
| og_image | string | 255 | ❌ |
| canonical_url | string | 255 | ❌ |
| robots | string | 50 | ❌ |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| entity_idx | unique | entity_type, entity_id |

---

## Collection 17: blog_posts

**ID**: `blog_posts`  
**Name**: Blog Posts  
**Purpose**: Blog/content marketing

### Attributes

| Field | Type | Size/Values | Required | Default |
|-------|------|-------------|----------|---------|
| author_id | string | 36 | ✅ | - |
| category_id | string | 36 | ❌ | - |
| title | string | 2000 | ✅ | - |
| slug | string | 200 | ✅ | - |
| content | string | 100000 | ✅ | - |
| excerpt | string | 2000 | ❌ | - |
| featured_image | string | 255 | ❌ | - |
| status | enum | draft, published, archived | ✅ | draft |
| published_at | datetime | - | ❌ | - |
| views_count | integer | - | ❌ | 0 |
| allow_comments | boolean | - | ✅ | true |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| slug_idx | unique | slug |
| status_idx | key | status |
| author_id_idx | key | author_id |

---

## Collection 18: faqs

**ID**: `faqs`  
**Name**: FAQs  
**Purpose**: FAQ system

### Attributes

| Field | Type | Size | Required | Default |
|-------|------|------|----------|---------|
| category | string | 100 | ✅ | - |
| question | string | 2000 | ✅ | - |
| answer | string | 10000 | ✅ | - |
| position | integer | - | ❌ | 0 |
| is_published | boolean | - | ✅ | true |
| views_count | integer | - | ❌ | 0 |

### Indexes

| Name | Type | Attributes |
|------|------|-----------|
| category_idx | key | category |
| published_idx | key | is_published |

---

## Storage Buckets

### 1. listing_images
- **Max Size**: 10 MB
- **Extensions**: jpg, jpeg, png, webp
- **Permissions**: Public read, authenticated create

### 2. user_avatars
- **Max Size**: 2 MB
- **Extensions**: jpg, jpeg, png
- **Permissions**: Public read, authenticated create

### 3. listing_documents
- **Max Size**: 5 MB
- **Extensions**: pdf
- **Permissions**: Owner only

### 4. blog_images
- **Max Size**: 5 MB
- **Extensions**: jpg, jpeg, png, webp
- **Permissions**: Public read, authenticated create

---

## JSON Field Formats

### listings.title (i18n)
```json
{
  "en": "Beautiful House in Colombo",
  "si": "කොළඹ හි ලස්සන නිවසක්"
}
```

### listings.location
```json
{
  "country": "LK",
  "country_name": "Sri Lanka",
  "region": "Western",
  "city": "Colombo",
  "area": "Nugegoda",
  "address": "123 Main Street",
  "zip": "10250",
  "lat": 6.8649,
  "lng": 79.8997
}
```

### listings.contact
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94771234567",
  "whatsapp": "+94771234567",
  "show_email": true,
  "show_phone": true
}
```

### listings.attributes
```json
{
  "bedrooms": 3,
  "bathrooms": 2,
  "size": "2000 sqft",
  "parking": "2 cars",
  "floor": "2nd",
  "age": "5 years"
}
```

---

## 🔗 Collection Relationships

### Primary Relationships

```
users_extended
    └── listings (user_id → $id)
        ├── categories (category_id → $id)
        ├── reviews (listing_id → $id)
        ├── favorites (listing_id → $id)
        ├── listing_offers (listing_id → $id)
        └── transactions (listing_id → $id)

categories
    └── listings (category_id → $id)
        └── categories (parent_id → $id) [self-referencing]

countries (code)
    └── regions (country_code → code)
        └── cities (region_id → $id)
            └── areas (city_id → $id)

users_extended
    ├── reviews (reviewer_id → user_id, seller_id → user_id)
    ├── favorites (user_id → user_id)
    ├── saved_searches (user_id → user_id)
    ├── transactions (user_id → user_id, seller_id → user_id)
    ├── user_wallets (user_id → user_id)
    ├── listing_offers (buyer_id → user_id)
    └── blog_posts (author_id → user_id)

seo_meta (entity_type + entity_id)
    ├── listings (entity_type='listing', entity_id → listing.$id)
    ├── categories (entity_type='category', entity_id → category.$id)
    ├── cms_pages (entity_type='page', entity_id → page.$id)
    └── users_extended (entity_type='user', entity_id → user.$id)
```

### Relationship Details

| Parent Collection | Child Collection | Foreign Key | Relationship Type | Description |
|-------------------|------------------|-------------|-------------------|-------------|
| users_extended | listings | user_id | One-to-Many | User owns multiple listings |
| categories | listings | category_id | One-to-Many | Category has multiple listings |
| categories | categories | parent_id | One-to-Many | Category hierarchy (self-ref) |
| countries | regions | country_code | One-to-Many | Country has multiple regions |
| regions | cities | region_id | One-to-Many | Region has multiple cities |
| cities | areas | city_id | One-to-Many | City has multiple areas |
| listings | reviews | listing_id | One-to-Many | Listing has multiple reviews |
| listings | favorites | listing_id | Many-to-Many | Users favorite listings |
| listings | listing_offers | listing_id | One-to-Many | Listing receives offers |
| users_extended | favorites | user_id | One-to-Many | User has favorites |
| users_extended | saved_searches | user_id | One-to-Many | User has saved searches |
| users_extended | reviews | reviewer_id | One-to-Many | User writes reviews |
| users_extended | reviews | seller_id | One-to-Many | User receives reviews |
| users_extended | transactions | user_id | One-to-Many | User makes payments |
| users_extended | user_wallets | user_id | One-to-One | User has one wallet |
| users_extended | listing_offers | buyer_id | One-to-Many | User makes offers |
| users_extended | blog_posts | author_id | One-to-Many | User writes blog posts |

### Entity Relationship Diagram

```
┌─────────────────┐
│ users_extended  │
│ (Appwrite Auth) │
└────────┬────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│   listings      │   │   user_wallets  │
│                 │   │                 │
│ - user_id       │   │ - user_id (FK)  │
│ - category_id   │   │ - balance       │
└────────┬────────┘   └─────────────────┘
         │
         ├──────────┬──────────┬──────────┐
         │          │          │          │
         ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ reviews  │ │favorites │ │  offers  │ │transactions│
└──────────┘ └──────────┘ └──────────┘ └──────────┘

┌─────────────────┐
│   categories    │
│                 │
│ - parent_id ───┐│ (self-referencing)
└────────┬────────┘
         │
         └─────► listings (category_id)

┌─────────────────┐
│   countries     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    regions      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     cities      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     areas       │
└─────────────────┘
```

---

## ✅ Validation Rules

### String Fields

#### Email Validation
- **Fields**: `contact.email` (in listings JSON), `s_contact_email` (OSClass)
- **Pattern**: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- **Example**: `user@example.com`

#### Phone Validation
- **Fields**: `contact.phone`, `phone_land`, `phone_mobile`
- **Pattern**: `^\+?[1-9]\d{1,14}$` (E.164 format)
- **Example**: `+94771234567`

#### Slug Validation
- **Fields**: `slug` (all collections)
- **Pattern**: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- **Min Length**: 3
- **Max Length**: 200
- **Example**: `beautiful-house-colombo`

#### URL Validation
- **Fields**: `website`, `videos`, `canonical_url`
- **Pattern**: `^https?:\/\/.+`
- **Example**: `https://example.com`

#### Country Code
- **Fields**: `country_code`, `fk_c_country_code`
- **Pattern**: `^[A-Z]{2}$` (ISO 3166-1 alpha-2)
- **Example**: `LK`, `US`

#### Currency Code
- **Fields**: `currency_code`
- **Pattern**: `^[A-Z]{3}$` (ISO 4217)
- **Example**: `LKR`, `USD`

### Integer Fields

#### Price Fields
- **Fields**: `price`, `amount`, `offer_amount`, `min_bid_amount`, `current_bid_amount`
- **Min**: 0
- **Max**: 999999999999 (1 trillion cents = 10 billion currency units)
- **Validation**: Must be positive integer (cents/smallest unit)

#### Rating
- **Field**: `rating` (reviews)
- **Min**: 1
- **Max**: 5
- **Validation**: Integer only

#### Count Fields
- **Fields**: `views_count`, `listings_count`, `rating_count`, `bid_count`
- **Min**: 0
- **Validation**: Non-negative integer

#### Position/Order
- **Fields**: `position`, `i_position`
- **Min**: 0
- **Max**: 999
- **Default**: 0

#### Expiration Days
- **Field**: `expiration_days`
- **Min**: 1
- **Max**: 365
- **Default**: 30

### Float Fields

#### Coordinates
- **Field**: `latitude`
- **Min**: -90
- **Max**: 90
- **Precision**: 6 decimal places

- **Field**: `longitude`
- **Min**: -180
- **Max**: 180
- **Precision**: 6 decimal places

#### Rating Average
- **Field**: `rating_average`
- **Min**: 0
- **Max**: 5.0
- **Precision**: 1 decimal place

### Boolean Fields
- **Values**: `true` or `false`
- **No Validation**: Accept boolean only
- **Fields**: All `is_*`, `b_*`, `allow_*` fields

### Enum Fields

#### listing_type
- **Values**: `sale`, `rent`, `wanted`
- **Required**: Yes
- **Default**: `sale`

#### status (listings)
- **Values**: `draft`, `pending`, `active`, `sold`, `expired`, `rejected`
- **Required**: Yes
- **Default**: `pending`

#### account_type
- **Values**: `individual`, `business`, `agent`
- **Required**: Yes
- **Default**: `individual`

#### verification_status
- **Values**: `unverified`, `email_verified`, `phone_verified`, `id_verified`
- **Required**: Yes
- **Default**: `unverified`

#### frequency (saved_searches)
- **Values**: `instant`, `daily`, `weekly`
- **Required**: Yes
- **Default**: `daily`

#### transaction_type
- **Values**: `premium_upgrade`, `featured`, `bump`, `package`, `listing_fee`
- **Required**: Yes

#### payment_method
- **Values**: `card`, `bank_transfer`, `wallet`, `cash`
- **Required**: Yes

#### payment_status
- **Values**: `pending`, `completed`, `failed`, `refunded`
- **Required**: Yes
- **Default**: `pending`

#### offer_status
- **Values**: `pending`, `accepted`, `rejected`, `countered`, `expired`
- **Required**: Yes
- **Default**: `pending`

#### entity_type (seo_meta)
- **Values**: `listing`, `category`, `page`, `user`
- **Required**: Yes

#### blog_status
- **Values**: `draft`, `published`, `archived`
- **Required**: Yes
- **Default**: `draft`

### DateTime Fields

- **Format**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Example**: `2025-12-10T14:30:00.000Z`
- **Validation**: Valid date/time, not in far past (> 2000-01-01)

#### Special Validations

- **expires_at**: Must be future date
- **published_at**: Must be <= current date
- **auction_ends_at**: Must be future date if auction_enabled is true

### JSON Fields

#### i18n JSON (title, description, name, etc.)
```json
{
  "en": "string",
  "si": "string"
}
```
- **Required Keys**: At least one language key (en, si, ta, etc.)
- **String Length**: 
  - `title`: 1-500 chars per language
  - `description`: 1-10000 chars per language
  - `name`: 1-200 chars per language

#### location JSON
```json
{
  "country": "string (2 chars)",
  "country_name": "string",
  "region": "string",
  "city": "string",
  "area": "string (optional)",
  "address": "string (1-500 chars)",
  "zip": "string (optional)",
  "lat": "number (-90 to 90)",
  "lng": "number (-180 to 180)"
}
```
- **Required**: country, city, address
- **Valid Coordinates**: If provided, must be valid lat/lng

#### contact JSON
```json
{
  "name": "string (1-100 chars)",
  "email": "string (valid email)",
  "phone": "string (E.164 format)",
  "whatsapp": "string (optional, E.164)",
  "show_email": "boolean",
  "show_phone": "boolean"
}
```
- **Required**: name, email, phone
- **Email**: Must match email validation pattern
- **Phone**: Must match phone validation pattern

#### attributes JSON
```json
{
  "key": "value"
}
```
- **Flexible**: Any key-value pairs
- **Common Keys**: bedrooms (int), bathrooms (int), size (string), parking (string)
- **Max Size**: 10KB

#### business_info JSON
```json
{
  "name": "string (1-200 chars)",
  "license": "string (optional)",
  "category": "string (optional)",
  "registration_number": "string (optional)"
}
```

#### search_params JSON
```json
{
  "category_id": "string (optional)",
  "listing_type": "string (optional)",
  "min_price": "number (optional)",
  "max_price": "number (optional)",
  "location": "object (optional)",
  "keywords": "string (optional)"
}
```

### Array Fields

#### features (listings)
- **Type**: Array of strings
- **Max Items**: 50
- **Each Item**: 1-100 chars
- **Example**: `["parking", "pool", "garden", "security"]`

#### images (listings)
- **Type**: Array of strings (file IDs)
- **Max Items**: 20
- **Format**: Appwrite file ID or URL
- **Example**: `["64f8a1b2c3d4e5f6", "64f8a1b2c3d4e5f7"]`

#### videos (listings)
- **Type**: Array of strings (URLs)
- **Max Items**: 5
- **Format**: YouTube URL or file ID
- **Example**: `["https://youtube.com/watch?v=xxxxx"]`

#### seo_keywords
- **Type**: Array of strings
- **Max Items**: 20
- **Each Item**: 1-50 chars
- **Example**: `["real estate", "property", "colombo", "house"]`

#### meta_keywords (seo_meta)
- **Type**: Array of strings
- **Max Items**: 30
- **Each Item**: 1-50 chars

---

## 🎯 Business Logic Validations

### Listings

1. **Price Required for Sale/Rent**
   - If `listing_type` is `sale` or `rent`, `price` must be > 0
   - If `listing_type` is `wanted`, `price` can be 0 or null

2. **Auction Validation**
   - If `auction_enabled` is true:
     - `min_bid_amount` must be > 0
     - `auction_ends_at` must be future date
     - `status` cannot be `sold`

3. **Premium Listings**
   - `is_premium` can only be set to true if user has active transaction

4. **Status Transitions**
   - Valid transitions:
     - `draft` → `pending` → `active`
     - `active` → `sold` or `expired`
     - `pending` → `rejected`
   - Cannot change from `sold` to any other status

### Reviews

1. **One Review Per Listing Per User**
   - Unique constraint on (`listing_id`, `reviewer_id`)

2. **Cannot Review Own Listing**
   - `reviewer_id` !== `listing.user_id`

3. **Review After Transaction**
   - Ideally, user should have contacted seller before reviewing

### Listing Offers

1. **Offer Amount Validation**
   - `offer_amount` must be >= `listing.min_bid_amount` (if auction)
   - `offer_amount` must be > 0

2. **Cannot Offer on Own Listing**
   - `buyer_id` !== `listing.user_id`

3. **Offer Expiration**
   - If `expires_at` is set, status auto-changes to `expired` after that time

### Transactions

1. **Amount Validation**
   - `amount` must match the service price
   - For `listing_fee`, amount depends on listing settings

2. **Payment Completion**
   - `completed_at` can only be set when `payment_status` is `completed`

### User Wallets

1. **Balance Validation**
   - `balance` cannot be negative
   - Deductions checked before processing

---

## 📋 Required Field Summary

### Always Required

- **All Collections**: `$id`, `$createdAt`, `$updatedAt`
- **Listings**: user_id, category_id, title, description, slug, listing_type, status, price, currency_code, location, contact, expires_at, ip_address
- **Categories**: name, slug, is_enabled, price_enabled, expiration_days
- **Users Extended**: user_id, username, account_type, verification_status
- **Reviews**: listing_id, reviewer_id, seller_id, rating, is_approved
- **Transactions**: user_id, seller_id, transaction_type, amount, currency_code, payment_method, payment_status

### Conditionally Required

- **Auction Fields**: Required if `auction_enabled` is true
  - min_bid_amount, auction_ends_at

- **Business Fields**: Required if `account_type` is `business`
  - business_info (with at least name)

---

**Total**: 18 Collections | 4 Storage Buckets | Full i18n Support | Modern JSON Schema | Complete Validation Rules
