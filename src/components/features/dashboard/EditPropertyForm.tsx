"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { propertyFormSchema, PropertyFormValues } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, MapPin, Home, List, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/image-upload"
import { CityAutocomplete } from "@/components/ui/city-autocomplete"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getRegions } from "@/lib/actions/location"

// Generic property type compatible with Appwrite documents
interface Property {
    $id: string
    type: string
    district: string
    city: string
    address?: string | null
    title: string
    price: number
    price_negotiable?: boolean
    size: string
    description: string
    bedrooms?: number | null
    bathrooms?: number | null
    features?: string[] | null
    images?: string[] | null
    contact_name?: string
    contact_phone?: string
    whatsapp?: string | null
    status?: string
    user_id: string
}

const steps = [
    { id: 1, name: "Type & Location", icon: MapPin },
    { id: 2, name: "Details", icon: Home },
    { id: 3, name: "Features", icon: List },
    { id: 4, name: "Media & Contact", icon: ImageIcon },
]

interface EditPropertyFormProps {
    property: Property
}

export function EditPropertyForm({ property }: EditPropertyFormProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [regions, setRegions] = useState<{ id: string, name: string, slug: string }[]>([])

    // Safely transform property data to form values
    const transformPropertyToFormValues = (prop: Property): PropertyFormValues => {
        return {
            type: prop.type as "land" | "house" | "commercial",
            district: prop.district,
            city: prop.city,
            address: prop.address || "",
            title: prop.title,
            price: prop.price ?? 0,
            priceNegotiable: prop.price_negotiable ?? false,
            size: prop.size,
            description: prop.description,
            bedrooms: prop.bedrooms ?? undefined,
            bathrooms: prop.bathrooms ?? undefined,
            features: prop.features || [],
            images: prop.images || [],
            contactName: prop.contact_name || "",
            contactPhone: prop.contact_phone || "",
            whatsapp: prop.whatsapp || "",
        }
    }
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
    const router = useRouter()

    // Fetch regions on mount and set selected region based on property.district
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const data = await getRegions()
                setRegions(data)

                // Find and set the region that matches the property's district
                const matchingRegion = data.find(r => r.name === property.district)
                if (matchingRegion) {
                    setSelectedRegionId(matchingRegion.id)
                }
            } catch (error) {
                toast.error("Failed to load locations")
            }
        }
        fetchRegions()
    }, [property.district])

    // Create form values with explicit type
    const initialFormValues: PropertyFormValues = {
        type: property.type as "land" | "house" | "commercial",
        district: property.district,
        city: property.city,
        address: property.address || "",
        title: property.title,
        price: property.price,
        priceNegotiable: property.price_negotiable ?? false,
        size: property.size,
        description: property.description,
        bedrooms: property.bedrooms ?? undefined,
        bathrooms: property.bathrooms ?? undefined,
        features: property.features || [],
        images: property.images || [],
        contactName: property.contact_name || "",
        contactPhone: property.contact_phone || "",
        whatsapp: property.whatsapp || "",
    }

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertyFormSchema) as any,
        defaultValues: initialFormValues,
        mode: "onChange",
    })

    const propertyType = form.watch("type")

    const validateStep = async (step: number) => {
        let fieldsToValidate: (keyof PropertyFormValues)[] = []

        switch (step) {
            case 1:
                fieldsToValidate = ["type", "district", "city", "address"]
                break
            case 2:
                fieldsToValidate = ["title", "price", "size"]
                break
            case 3:
                fieldsToValidate = ["description"]
                if (propertyType !== "land") {
                    fieldsToValidate.push("bedrooms", "bathrooms")
                }
                break
            case 4:
                fieldsToValidate = ["contactName", "contactPhone"]
                break
        }

        const result = await form.trigger(fieldsToValidate)
        if (!result) {
            toast.error("Please fix the errors before proceeding")
        }
        return result
    }

    const handleNext = async () => {
        const isValid = await validateStep(currentStep)
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length))
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const onSubmit = async (data: PropertyFormValues) => {
        setIsSubmitting(true)
        const toastId = toast.loading("Updating property...")

        try {
            const { updateProperty } = await import("@/lib/actions/property")
            const result = await updateProperty(property.$id, data)

            if (result?.error) {
                toast.error(result.error, { id: toastId })
            } else {
                toast.success("Property updated successfully!", { id: toastId })
                // Let the server action redirect happen
            }
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong. Please try again.", { id: toastId })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Stepper */}
            <nav aria-label="Progress" className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10" />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-300 -z-10"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step) => {
                        const Icon = step.icon
                        const isActive = step.id === currentStep
                        const isCompleted = step.id < currentStep

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-950 px-2 z-10">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                        isActive ? "border-emerald-600 bg-emerald-600 text-white" :
                                            isCompleted ? "border-emerald-600 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "border-slate-300 dark:border-slate-700 text-slate-400"
                                    )}
                                    aria-current={isActive ? "step" : undefined}
                                >
                                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={cn("text-xs font-medium", isActive ? "text-emerald-600" : "text-slate-500")}>
                                    {step.name}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </nav>

            <Card className="border-emerald-100 dark:border-emerald-900/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl md:text-2xl">{steps[currentStep - 1].name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Step 1: Type & Location */}
                            {currentStep === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Property Type</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        className="flex flex-col md:flex-row gap-4"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:border-emerald-500 cursor-pointer transition-colors has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/10">
                                                            <FormControl>
                                                                <RadioGroupItem value="land" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-base cursor-pointer w-full">Land</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:border-emerald-500 cursor-pointer transition-colors has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/10">
                                                            <FormControl>
                                                                <RadioGroupItem value="house" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-base cursor-pointer w-full">House</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:border-emerald-500 cursor-pointer transition-colors has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/10">
                                                            <FormControl>
                                                                <RadioGroupItem value="commercial" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-base cursor-pointer w-full">Commercial</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="district"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Province</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            const region = regions.find(r => r.name === value)
                                                            if (region) {
                                                                setSelectedRegionId(region.id)
                                                                form.setValue("city", "")
                                                            }
                                                            field.onChange(value)
                                                        }}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Province" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {regions.map((region) => (
                                                                <SelectItem key={region.id} value={region.name}>
                                                                    {region.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl>
                                                        <CityAutocomplete
                                                            regionId={selectedRegionId}
                                                            value={field.value || ""}
                                                            onChange={field.onChange}
                                                            disabled={!selectedRegionId}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Street address" {...field} />
                                                </FormControl>
                                                <FormDescription>Address can be hidden from public view if desired.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step 2: Details */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ad Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. 10 Perch Land for Sale in Malabe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price (LKR)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rs</span>
                                                            <Input type="number" placeholder="Total Price" className="pl-9" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="size"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Size</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. 10.5 Perches" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="priceNegotiable"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Suggest Price is Negotiable</FormLabel>
                                                    <FormDescription>
                                                        Buyers are more likely to contact negotiable prices.
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step 3: Features */}
                            {currentStep === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {propertyType !== "land" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="bedrooms"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bedrooms</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="bathrooms"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bathrooms</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe your property in detail..."
                                                        className="min-h-[150px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="space-y-2">
                                        <Label>Features (Optional)</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {["Water", "Electricity", "Three Phase", "Clear Deeds", "Approved Plan"].map((feature) => (
                                                <div key={feature} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={feature}
                                                        checked={form.watch("features")?.includes(feature)}
                                                        onCheckedChange={(checked) => {
                                                            const current = form.getValues("features") || [];
                                                            if (checked) {
                                                                form.setValue("features", [...current, feature]);
                                                            } else {
                                                                form.setValue("features", current.filter((f) => f !== feature));
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor={feature} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                        {feature}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Media & Contact */}
                            {currentStep === 4 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <FormLabel>Property Images</FormLabel>
                                        <FormDescription>Upload up to 10 images for your property.</FormDescription>

                                        <FormField
                                            control={form.control}
                                            name="images"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <ImageUpload
                                                            value={field.value || []}
                                                            onChange={(newUrls) => field.onChange(newUrls)}
                                                            onRemove={(urlToRemove) => field.onChange(field.value?.filter((url) => url !== urlToRemove))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="contactName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contact Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="contactPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mobile Number</FormLabel>
                                                    <FormControl>
                                                        <Input type="tel" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="whatsapp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>WhatsApp Number (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="07X XXX XXXX" type="tel" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Buyers can contact you directly via WhatsApp. Leave blank if same as mobile.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-between bg-slate-50 dark:bg-slate-900/50 p-6 border-t">
                    <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
                        Back
                    </Button>

                    {currentStep < steps.length ? (
                        <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
                            Next
                        </Button>
                    ) : (
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                </>
                            ) : "Save Changes"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
