# Appwrite Setup Guide

## RECOMMENDED: Automated Setup
The easiest way to set up your Appwrite instance is by running the included setup script. This ensures accurate schema creation.

1. **Configure Environment Variables**:
   Ensure your `.env.local` contains:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=...
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=...
   APPWRITE_API_KEY=...
   ```

2. **Run the Setup Script**:
   ```bash
   npx tsx scripts/setup-appwrite-collections.ts
   ```

---

## MANUAL SETUP (Reference)

If you prefer to set up manually, follow these steps strictly.

### 1. Create Database
- **ID**: `landsale_db`
- **Name**: `LandSale Database`

### 2. Create Listings Collection
- **ID**: `listings`
- **Name**: `Listings`
- **Permissions**:
  - Read: `any`
  - Create/Update/Delete: `users`

**Attributes**:
| Key | Type | Size | Desired Value Storage |
|---|---|---|---|
| `url` | String | 255 | URL Slug |
| `status` | String | 50 | Status (active/pending) |
| `listing_type`| String | 50 | sale/rent |
| `title` | String | 5000 | **JSON**: `{"en": "..."}` |
| `description` | String | 10000 | **JSON**: `{"en": "..."}` |
| `location` | String | 5000 | **JSON**: Location details |
| `contact` | String | 5000 | **JSON**: Contact info |
| `attributes` | String | 5000 | **JSON**: Property specs |
| `images` | String (Array)| 5000 | Image URLs |
| `price` | Integer | - | Price in cents |
| `currency_code`| String | 10 | 'LKR' |

*(See `docs/architecture/APPWRITE_SCHEMA.md` for full attribute list)*

### 3. Create Other Collections
Create `favorites`, `regions`, and `cities` collections as per the schema reference.

### 4. Create Storage Buckets
1. **Listings Bucket**:
   - **ID**: `listing_images`
   - **Permissions**: Read(`any`), Create(`users`), Update/Delete(`owners`)
   - **File Extensions**: jpg, png, webp
2. **Avatars Bucket**:
   - **ID**: `user_avatars`

---

## Verification
After setup, run `npm run dev` and ensure the application connects without database errors.
