# API Integration Guide

This document provides a comprehensive guide to the frontend-backend integration for the LandSale.lk platform.

## Overview

The frontend integrates with **Appwrite** as the backend-as-a-service (BaaS). All database operations are performed through typed action functions located in `src/lib/actions/`.

## Architecture

```
┌──────────────────┐      ┌───────────────────┐      ┌─────────────────┐
│   React/Next.js  │ ───▶ │  Server Actions   │ ───▶ │    Appwrite     │
│    Components    │      │  (src/lib/actions)│      │   Collections   │
└──────────────────┘      └───────────────────┘      └─────────────────┘
```

## Appwrite Configuration

### Environment Variables

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=osclass_landsale_db
APPWRITE_API_KEY=your-api-key (server-side only)
```

### Client Types

| Client | File | Usage |
|--------|------|-------|
| Session Client | `lib/appwrite/server.ts` | Authenticated user operations |
| Admin Client | `lib/appwrite/server.ts` | Elevated privilege operations |
| Browser Client | `lib/appwrite/client.ts` | Client-side operations only |

## Action Functions Reference

### Authentication (`lib/actions/auth.ts`)

| Function | Description | Auth Required |
|----------|-------------|---------------|
| `signOut()` | End user session | ✅ |
| `getCurrentUser()` | Get current user info | ✅ |
| `updateUserProfile(name)` | Update user name | ✅ |
| `updateUserPassword(new, old)` | Change password | ✅ |
| `requestPasswordReset(email)` | Send reset email | ❌ |

### Properties (`lib/actions/property.ts`)

| Function | Description | Auth Required |
|----------|-------------|---------------|
| `createProperty(data)` | Create new listing | ✅ |
| `updateProperty(id, data)` | Update existing listing | ✅ (owner) |
| `deleteProperty(id)` | Delete listing | ✅ (owner) |
| `getPropertyForEdit(id)` | Get property for editing | ✅ (owner) |
| `getSimilarProperties(id, type, district)` | Get similar listings | ❌ |
| `incrementPropertyViews(id)` | Increment view counter | ❌ |

### Favorites (`lib/actions/favorites.ts`)

| Function | Description | Auth Required |
|----------|-------------|---------------|
| `toggleFavorite(propertyId)` | Add/remove favorite | ✅ |
| `checkIsFavorited(propertyId)` | Check if favorited | ✅ |
| `getUserFavorites()` | Get user's favorites | ✅ |
| `getUserFavoriteIds()` | Get favorite IDs only | ✅ |

### Inquiries (`lib/actions/inquiry.ts`)

| Function | Description | Auth Required |
|----------|-------------|---------------|
| `sendInquiry(data)` | Send inquiry to seller | ✅ |
| `getInquiries()` | Get received inquiries | ✅ |
| `markInquiryAsRead(id)` | Mark as read | ✅ |
| `getUnreadInquiryCount()` | Get unread count | ✅ |

### Analytics (`lib/actions/analytics.ts`)

| Function | Description | Auth Required |
|----------|-------------|---------------|
| `getDashboardStats()` | Get overall statistics | ✅ |
| `getPropertyAnalytics()` | Per-property analytics | ✅ |
| `getTopProperties(limit)` | Top performing properties | ✅ |

## Error Handling

All actions use centralized error handling from `lib/appwrite/errors.ts`:

```typescript
import { handleAppwriteError, withRetry } from '@/lib/appwrite/errors'

// Example: Operation with retry
const result = await withRetry(() => databases.createDocument(...))

// Example: Error classification
try {
    await someOperation()
} catch (error) {
    const details = handleAppwriteError(error)
    console.log(details.userMessage) // User-friendly message
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHENTICATED` | Session expired or missing |
| `UNAUTHORIZED` | Permission denied |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input data |
| `RATE_LIMITED` | Too many requests |
| `SERVER_ERROR` | Backend error |

## Type System

All collection types are defined in `src/types/appwrite.ts`:

```typescript
import type { ListingDocument, Property, ActionResult } from '@/types/appwrite'
import { parseJsonField, getLocalizedText } from '@/types/appwrite'

// Parse JSON fields
const location = parseJsonField<LocationJson>(listing.location, {})

// Get localized text
const title = getLocalizedText(listing.title, 'en')
```

## Testing

Run tests with:

```bash
npm run test              # Watch mode
npm run test:coverage     # With coverage report
```

Test files are located in `src/__tests__/lib/actions/`.

## Collections Reference

For complete schema documentation, see [APPWRITE_COLLECTIONS_REFERENCE.md](../APPWRITE_COLLECTIONS_REFERENCE.md).
