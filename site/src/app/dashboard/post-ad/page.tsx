import { PostAdForm } from "@/components/features/dashboard/PostAdForm"

export default function PostAdPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Post a New Ad</h1>
                <p className="text-muted-foreground">
                    Follow the simple steps below to list your property.
                </p>
            </div>

            <PostAdForm />
        </div>
    )
}
