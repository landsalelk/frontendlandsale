
import { InteractivePropertyCard, Property } from "./InteractivePropertyCard"

interface SimilarPropertiesProps {
    properties: any[] // Using any[] to bypass strict DB type matching for now, as InteractivePropertyCard handles the shape
}

export function SimilarProperties({ properties }: SimilarPropertiesProps) {
    if (!properties || properties.length === 0) return null

    return (
        <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <InteractivePropertyCard
                        key={property.id}
                        property={property as Property}
                    />
                ))}
            </div>
        </section>
    )
}
