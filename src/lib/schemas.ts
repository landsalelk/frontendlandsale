import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export const signupSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export const propertyFormSchema = z.object({
    // Step 1: Type & Location
    type: z.enum(["land", "house", "commercial"] as const),
    district: z.string().min(1, "District is required"),
    city: z.string().min(1, "City is required"),
    address: z.string().optional(), // Specific address can be optional for privacy

    // Step 2: Basic Details
    title: z.string().min(10, "Title should be descriptive (at least 10 chars)"),
    price: z.coerce.number().min(1, "Price is required"),
    priceNegotiable: z.boolean().default(false),
    size: z.string().min(1, "Size is required (e.g. 10 Perches)"),

    // Step 3: Features & Specifics
    description: z.string().min(20, "Description must be at least 20 characters"),
    bedrooms: z.coerce.number().optional(),
    bathrooms: z.coerce.number().optional(),
    features: z.array(z.string()).default([]), // ["Water", "Electricity", "Paved Road"]

    // Step 4: Media & Contact
    images: z.array(z.string()).default([]), // URLs for now
    contactName: z.string().min(2, "Contact name is required"),
    contactPhone: z.string().min(9, "Valid phone number is required"),
    whatsapp: z.string().optional(),
})

export type PropertyFormValues = z.infer<typeof propertyFormSchema>
