import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPropertyImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder-property.jpg"
  if (path.startsWith("http")) return path
  if (path.startsWith("/uploads/properties")) {
    // Legacy path: /uploads/properties/0/101.jpg -> /0/101.jpg (served from public/0/101.jpg)
    return path.replace("/uploads/properties", "")
  }
  return path
}

export function formatPrice(price: number): string {
  if (!price) return "0";

  if (price >= 1000000000) {
    return (price / 1000000000).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1') + " Billion";
  }
  if (price >= 1000000) {
    return (price / 1000000).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1') + " Million";
  }
  if (price >= 100000) {
    return (price / 100000).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1') + " Lakh";
  }
  return price.toLocaleString();
}

// Helper function to transform new schema to old format for UI compatibility
export function transformListingToProperty(listing: any) {
  if (!listing) return listing

  let title = ''
  let description = ''
  let location: any = {}
  let contact: any = {}
  let attributes: any = {}

  try {
    if (typeof listing.title === 'string' && listing.title) {
      const parsed = JSON.parse(listing.title)
      title = parsed?.en || ''
    }
  } catch { /* ignore */ }

  let extractedImage = '';

  try {
    if (typeof listing.description === 'string' && listing.description) {
      const parsed = JSON.parse(listing.description)
      description = parsed?.en || ''
      // Fallback: Check if image is stored in description metadata
      if (parsed?.image) {
        extractedImage = parsed.image;
      }
    }
  } catch { /* ignore */ }

  try {
    if (typeof listing.location === 'string' && listing.location) {
      location = JSON.parse(listing.location)
    }
  } catch { /* ignore */ }

  try {
    if (typeof listing.contact === 'string' && listing.contact) {
      contact = JSON.parse(listing.contact)
    }
  } catch { /* ignore */ }

  try {
    if (typeof listing.attributes === 'string' && listing.attributes) {
      attributes = JSON.parse(listing.attributes)
    }
  } catch { /* ignore */ }

  // Use existing images, or fallback to extracted image
  const finalImages = listing.images && listing.images.length > 0
    ? listing.images
    : (extractedImage ? [extractedImage] : []);

  return {
    ...listing,
    title,
    description,
    type: listing.listing_type === 'sale' ? 'land' : listing.listing_type,
    district: location?.region || '',
    city: location?.city || '',
    address: location?.address || '',
    price: listing.price ? listing.price / 100 : 0,
    size: attributes?.size || '',
    bedrooms: attributes?.bedrooms || 0,
    bathrooms: attributes?.bathrooms || 0,
    views: listing.views_count || 0,
    contactName: contact?.name || '',
    contactPhone: contact?.phone || '',
    whatsapp: contact?.whatsapp || '',
    features: listing.features || [],
    images: finalImages,
    priceNegotiable: listing.price_negotiable || false,
    status: listing.status,
    verified: listing.is_verified === true, // Map DB field to UI expectation
  }
}
