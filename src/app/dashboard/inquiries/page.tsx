import { getCurrentUser } from "@/lib/appwrite/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mail, MailOpen, Phone, User, Calendar, Building2, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getPropertyImageUrl } from "@/lib/utils"
import { getInquiries } from "@/lib/actions/inquiry"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function InquiriesPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch inquiries using the action
    const { inquiries, error } = await getInquiries()

    // Count unread
    const unreadCount = inquiries?.filter(i => !i.is_read).length || 0

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        Inquiries
                        {unreadCount > 0 && (
                            <Badge className="bg-emerald-600">{unreadCount} new</Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground">
                        Messages from potential buyers interested in your properties.
                    </p>
                </div>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                    <CardContent className="pt-6">
                        <p className="text-red-600">Failed to load inquiries. Please try again later.</p>
                    </CardContent>
                </Card>
            )}

            {!error && inquiries?.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                <Mail className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No inquiries yet</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                When buyers send you messages about your properties, they will appear here.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {inquiries?.map((inquiry) => {
                    const property = inquiry.property as { id: string; title: string; images?: string[] } | null
                    const propertyImage = property?.images?.[0] ? getPropertyImageUrl(property.images[0]) : null

                    return (
                        <Card
                            key={inquiry.id}
                            className={`transition-all hover:shadow-md ${!inquiry.is_read
                                ? 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/10'
                                : ''
                                }`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                                {inquiry.sender_name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                {inquiry.sender_name}
                                                {!inquiry.is_read && (
                                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                                        New
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(inquiry.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {inquiry.is_read ? (
                                            <MailOpen className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <Mail className="w-4 h-4 text-emerald-600" />
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Property Reference */}
                                {property && (
                                    <Link
                                        href={`/properties/${property.id}`}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group"
                                    >
                                        {propertyImage ? (
                                            <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={propertyImage}
                                                    alt={property.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-12 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                                <Building2 className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate group-hover:text-emerald-600 transition-colors">
                                                {property.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">View property</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                                    </Link>
                                )}

                                {/* Message */}
                                <div className="bg-white dark:bg-slate-950 border rounded-lg p-4">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
                                </div>

                                {/* Contact Actions */}
                                <div className="flex flex-wrap gap-2">
                                    {inquiry.sender_phone && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={`tel:${inquiry.sender_phone}`}>
                                                <Phone className="w-4 h-4 mr-2" />
                                                {inquiry.sender_phone}
                                            </a>
                                        </Button>
                                    )}
                                    {inquiry.sender_email && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={`mailto:${inquiry.sender_email}?subject=Re: ${property?.title || 'Your Inquiry'}`}>
                                                <Mail className="w-4 h-4 mr-2" />
                                                Reply via Email
                                            </a>
                                        </Button>
                                    )}
                                    {inquiry.sender_phone && (
                                        <Button variant="outline" size="sm" className="border-green-500 text-green-600 hover:bg-green-50" asChild>
                                            <a href={`https://wa.me/${inquiry.sender_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                                WhatsApp
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
