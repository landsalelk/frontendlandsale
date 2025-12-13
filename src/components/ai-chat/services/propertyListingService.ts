// Property Listing Service for Natural Language Property Creation
import { DatabaseService, Property } from './databaseService';

export interface PropertyDraft {
    title?: string;
    description?: string;
    property_type?: 'house' | 'apartment' | 'condo' | 'townhouse' | 'land';
    price?: number;
    price_unit?: 'total' | 'per_perch' | 'per_acre';
    land_size?: number;
    land_unit?: 'perches' | 'acres' | 'square_feet';
    location?: string;
    district?: string;
    city?: string;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
    features?: string[];
    contact_phone?: string;
    contact_whatsapp?: string;
    images?: string[];
    status?: 'draft' | 'ready' | 'published';
}

export interface ListingConversationState {
    step: 'initial' | 'property_type' | 'location' | 'size' | 'price' | 'features' | 'contact' | 'review' | 'published';
    draft: PropertyDraft;
    missingFields: string[];
    lastQuestion?: string;
}

export class PropertyListingService {
    private databaseService: DatabaseService;
    private conversationState: ListingConversationState;

    constructor() {
        this.databaseService = DatabaseService.getInstance();
        this.conversationState = this.getInitialState();
    }

    private getInitialState(): ListingConversationState {
        return {
            step: 'initial',
            draft: {
                status: 'draft',
                amenities: [],
                features: [],
                images: []
            },
            missingFields: ['property_type', 'location', 'price', 'land_size'],
        };
    }

    resetConversation(): void {
        this.conversationState = this.getInitialState();
    }

    getState(): ListingConversationState {
        return { ...this.conversationState };
    }

    getDraft(): PropertyDraft {
        return { ...this.conversationState.draft };
    }

    // Extract property information from natural language
    extractPropertyInfo(message: string): Partial<PropertyDraft> {
        const extracted: Partial<PropertyDraft> = {};
        const lowerMessage = message.toLowerCase();

        // Property Type Detection
        if (lowerMessage.includes('land') || lowerMessage.includes('plot') || lowerMessage.includes('block')) {
            extracted.property_type = 'land';
        } else if (lowerMessage.includes('house') || lowerMessage.includes('home') || lowerMessage.includes('bungalow')) {
            extracted.property_type = 'house';
        } else if (lowerMessage.includes('apartment') || lowerMessage.includes('flat')) {
            extracted.property_type = 'apartment';
        } else if (lowerMessage.includes('condo')) {
            extracted.property_type = 'condo';
        } else if (lowerMessage.includes('townhouse')) {
            extracted.property_type = 'townhouse';
        }

        // Land Size Detection (perches)
        const perchMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:perch|perches|p)/i);
        if (perchMatch) {
            extracted.land_size = parseFloat(perchMatch[1]);
            extracted.land_unit = 'perches';
        }

        // Acres detection
        const acreMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:acre|acres|ac)/i);
        if (acreMatch) {
            extracted.land_size = parseFloat(acreMatch[1]);
            extracted.land_unit = 'acres';
        }

        // Square feet detection
        const sqftMatch = message.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|square\s*feet)/i);
        if (sqftMatch) {
            extracted.land_size = parseFloat(sqftMatch[1].replace(/,/g, ''));
            extracted.land_unit = 'square_feet';
        }

        // Price Detection (LKR)
        const pricePatterns = [
            /(?:rs\.?|lkr\.?|රු\.?)\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:million|m|mn)?/i,
            /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:million|m|mn)\s*(?:rupees?|lkr)?/i,
            /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:lakhs?|lacs?|lac)\s*(?:rupees?|lkr)?/i,
            /asking\s*(?:price\s*)?(?:rs\.?|lkr\.?)?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
            /price\s*(?:is\s*)?(?:rs\.?|lkr\.?)?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
        ];

        for (const pattern of pricePatterns) {
            const match = message.match(pattern);
            if (match) {
                let price = parseFloat(match[1].replace(/,/g, ''));

                // Handle million/lakh multipliers
                if (lowerMessage.includes('million') || lowerMessage.includes(' m ') || message.match(/\d+\s*m\b/i)) {
                    price *= 1000000;
                } else if (lowerMessage.includes('lakh') || lowerMessage.includes('lac')) {
                    price *= 100000;
                }

                extracted.price = price;

                // Check if price is per perch
                if (lowerMessage.includes('per perch') || lowerMessage.includes('/perch')) {
                    extracted.price_unit = 'per_perch';
                } else if (lowerMessage.includes('per acre') || lowerMessage.includes('/acre')) {
                    extracted.price_unit = 'per_acre';
                } else {
                    extracted.price_unit = 'total';
                }
                break;
            }
        }

        // Location Detection - Sri Lankan Districts & Cities
        const districts = [
            'colombo', 'gampaha', 'kalutara', 'kandy', 'matale', 'nuwara eliya',
            'galle', 'matara', 'hambantota', 'jaffna', 'kilinochchi', 'mannar',
            'vavuniya', 'mullaitivu', 'batticaloa', 'ampara', 'trincomalee',
            'kurunegala', 'puttalam', 'anuradhapura', 'polonnaruwa', 'badulla',
            'monaragala', 'ratnapura', 'kegalle'
        ];

        const popularCities = [
            'colombo', 'negombo', 'kandy', 'galle', 'jaffna', 'batticaloa',
            'moratuwa', 'dehiwala', 'mount lavinia', 'kotte', 'nugegoda',
            'maharagama', 'kaduwela', 'panadura', 'ratnapura', 'matara',
            'anuradhapura', 'kurunegala', 'trincomalee', 'weligama', 'hikkaduwa',
            'bentota', 'unawatuna', 'ella', 'nuwara eliya', 'bandarawela'
        ];

        for (const city of popularCities) {
            if (lowerMessage.includes(city)) {
                extracted.city = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                break;
            }
        }

        for (const district of districts) {
            if (lowerMessage.includes(district)) {
                extracted.district = district.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                break;
            }
        }

        // Generic location extraction
        const locationMatch = message.match(/(?:in|at|near|located\s+(?:in|at))\s+([A-Z][a-zA-Z\s]+?)(?:\s*,|\s*\.|$)/);
        if (locationMatch && !extracted.city && !extracted.district) {
            extracted.location = locationMatch[1].trim();
        }

        // Bedroom Detection
        const bedroomMatch = message.match(/(\d+)\s*(?:bed(?:room)?s?|br|bhk)/i);
        if (bedroomMatch) {
            extracted.bedrooms = parseInt(bedroomMatch[1]);
        }

        // Bathroom Detection
        const bathroomMatch = message.match(/(\d+)\s*(?:bath(?:room)?s?|ba)/i);
        if (bathroomMatch) {
            extracted.bathrooms = parseInt(bathroomMatch[1]);
        }

        // Phone Detection
        const phoneMatch = message.match(/(?:phone|call|contact|mobile|tel|whatsapp)?\s*:?\s*((?:\+94|0)?[0-9]{9,10})/i);
        if (phoneMatch) {
            extracted.contact_phone = phoneMatch[1];
        }

        // Features/Amenities Detection
        const features: string[] = [];
        const amenityKeywords = [
            'road access', 'main road', 'electricity', 'water supply', 'well water',
            'pipe water', 'swimming pool', 'garden', 'garage', 'parking', 'security',
            'gated community', 'near school', 'near hospital', 'near town', 'scenic view',
            'mountain view', 'beach front', 'river front', 'flat land', 'sloped',
            'corner lot', 'commercial zone', 'residential zone', 'freehold', 'leasehold',
            'immediate sale', 'urgent sale', 'negotiable', 'clear title'
        ];

        for (const amenity of amenityKeywords) {
            if (lowerMessage.includes(amenity)) {
                features.push(amenity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
            }
        }

        if (features.length > 0) {
            extracted.features = features;
        }

        return extracted;
    }

    // Update draft with extracted information
    updateDraft(info: Partial<PropertyDraft>): void {
        this.conversationState.draft = {
            ...this.conversationState.draft,
            ...info,
            features: [...(this.conversationState.draft.features || []), ...(info.features || [])],
            amenities: [...(this.conversationState.draft.amenities || []), ...(info.amenities || [])],
        };

        // Remove duplicates from features and amenities
        this.conversationState.draft.features = [...new Set(this.conversationState.draft.features)];
        this.conversationState.draft.amenities = [...new Set(this.conversationState.draft.amenities)];

        // Update missing fields
        this.updateMissingFields();
    }

    private updateMissingFields(): void {
        const draft = this.conversationState.draft;
        const missing: string[] = [];

        if (!draft.property_type) missing.push('property_type');
        if (!draft.location && !draft.city && !draft.district) missing.push('location');
        if (!draft.price) missing.push('price');
        if (!draft.land_size && draft.property_type === 'land') missing.push('land_size');

        this.conversationState.missingFields = missing;
    }

    // Get the next question based on what's missing
    getNextQuestion(): string | null {
        const draft = this.conversationState.draft;

        if (!draft.property_type) {
            return "What type of property are you selling? (Land, House, Apartment, etc.)";
        }

        if (!draft.location && !draft.city && !draft.district) {
            return "Where is your property located? Please provide the city or district.";
        }

        if (!draft.land_size && (draft.property_type === 'land' || !draft.property_type)) {
            return "What's the size of the property? (e.g., 20 perches, 1 acre)";
        }

        if (!draft.price) {
            return "What's your asking price for this property?";
        }

        if (!draft.contact_phone) {
            return "What's your contact number for interested buyers?";
        }

        return null;
    }

    // Check if listing is ready to be published
    isReadyToPublish(): boolean {
        const draft = this.conversationState.draft;
        return !!(
            draft.property_type &&
            (draft.location || draft.city || draft.district) &&
            draft.price
        );
    }

    // Generate a summary of the listing
    generateListingSummary(): string {
        const draft = this.conversationState.draft;

        let summary = `📋 **Your Property Listing Summary**\n\n`;

        summary += `🏷️ **Type:** ${draft.property_type ? draft.property_type.charAt(0).toUpperCase() + draft.property_type.slice(1) : 'Not specified'}\n`;

        const location = draft.city || draft.district || draft.location || 'Not specified';
        summary += `📍 **Location:** ${location}\n`;

        if (draft.land_size) {
            summary += `📐 **Size:** ${draft.land_size} ${draft.land_unit || 'perches'}\n`;
        }

        if (draft.price) {
            const formattedPrice = new Intl.NumberFormat('en-LK', {
                style: 'currency',
                currency: 'LKR',
                maximumFractionDigits: 0
            }).format(draft.price);
            summary += `💰 **Price:** ${formattedPrice}${draft.price_unit === 'per_perch' ? ' per perch' : ''}\n`;
        }

        if (draft.bedrooms) {
            summary += `🛏️ **Bedrooms:** ${draft.bedrooms}\n`;
        }

        if (draft.bathrooms) {
            summary += `🚿 **Bathrooms:** ${draft.bathrooms}\n`;
        }

        if (draft.features && draft.features.length > 0) {
            summary += `✨ **Features:** ${draft.features.join(', ')}\n`;
        }

        if (draft.contact_phone) {
            summary += `📞 **Contact:** ${draft.contact_phone}\n`;
        }

        return summary;
    }

    // Generate automatic title
    generateTitle(): string {
        const draft = this.conversationState.draft;
        const parts: string[] = [];

        if (draft.land_size) {
            parts.push(`${draft.land_size} ${draft.land_unit || 'Perch'}`);
        }

        if (draft.property_type) {
            parts.push(draft.property_type.charAt(0).toUpperCase() + draft.property_type.slice(1));
        }

        parts.push('for Sale');

        if (draft.city || draft.district) {
            parts.push(`in ${draft.city || draft.district}`);
        }

        return parts.join(' ');
    }

    // Generate automatic description
    generateDescription(): string {
        const draft = this.conversationState.draft;
        let desc = '';

        if (draft.property_type === 'land') {
            desc = `Beautiful ${draft.land_size || ''} ${draft.land_unit || 'perch'} land for sale`;
        } else {
            desc = `${draft.property_type ? draft.property_type.charAt(0).toUpperCase() + draft.property_type.slice(1) : 'Property'} for sale`;
        }

        if (draft.city || draft.district) {
            desc += ` in ${draft.city || draft.district}`;
        }

        desc += '.';

        if (draft.features && draft.features.length > 0) {
            desc += ` Features: ${draft.features.join(', ')}.`;
        }

        if (draft.price) {
            const formattedPrice = new Intl.NumberFormat('en-LK').format(draft.price);
            desc += ` Asking price: Rs. ${formattedPrice}${draft.price_unit === 'per_perch' ? ' per perch' : ''}.`;
        }

        return desc;
    }

    // Publish the listing
    async publishListing(userId: string): Promise<{ success: boolean; propertyId?: string; url?: string; error?: string }> {
        try {
            const draft = this.conversationState.draft;

            if (!this.isReadyToPublish()) {
                return { success: false, error: 'Listing is not complete. Please provide all required information.' };
            }

            // Use the new createListing method with correct schema format
            const result = await this.databaseService.createListing({
                title: draft.title || this.generateTitle(),
                description: draft.description || this.generateDescription(),
                property_type: draft.property_type || 'land',
                price: draft.price!,
                district: draft.district,
                city: draft.city,
                address: draft.location,
                land_size: draft.land_size,
                land_unit: draft.land_unit || 'perches',
                bedrooms: draft.bedrooms,
                bathrooms: draft.bathrooms,
                features: [...(draft.amenities || []), ...(draft.features || [])],
                images: draft.images || [],
                contact_phone: draft.contact_phone,
                contact_whatsapp: draft.contact_whatsapp,
                user_id: userId
            });

            if (result.error) {
                return { success: false, error: result.error.message };
            }

            this.conversationState.step = 'published';
            return {
                success: true,
                propertyId: result.data?.id,
                url: result.data?.url
            };

        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}

export default PropertyListingService;
