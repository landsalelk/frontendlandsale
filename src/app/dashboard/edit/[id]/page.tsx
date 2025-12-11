import { getPropertyForEdit } from "@/lib/actions/property"
import { notFound } from "next/navigation"
import { EditPropertyForm } from "@/components/features/dashboard/EditPropertyForm"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const property = await getPropertyForEdit(id)

    if (!property) {
        notFound()
    }

    // Transform Appwrite document to match EditPropertyForm's expected type
    const formattedProperty = {
        $id: property.$id,
        type: property.type || 'land',
        district: property.district || '',
        city: property.city || '',
        address: property.address,
        title: property.title || '',
        price: property.price || 0,
        price_negotiable: property.priceNegotiable,
        size: property.size || '',
        description: property.description || '',
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        features: property.features,
        images: property.images,
        contact_name: property.contactName,
        contact_phone: property.contactPhone,
        whatsapp: property.whatsapp,
        status: property.status,
        user_id: property.user_id,
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Your Listing</h1>
                <p className="text-muted-foreground">
                    Update the details of your property listing below.
                </p>
            </div>

            <EditPropertyForm property={formattedProperty} />
        </div>
    )
}

