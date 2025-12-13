"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Star, MessageCircle, CheckCircle2, Briefcase } from "lucide-react"
import { VerifiedBadge } from "../properties/VerifiedBadge"

export interface Agent {
    id: string
    name: string
    avatar?: string
    phone: string
    whatsapp?: string
    bio: string
    experience: number // years
    serviceAreas: string[]
    specializations: string[]
    rating: number
    reviewCount: number
    dealsCount: number
    isVerified: boolean
}

interface AgentCardProps {
    agent: Agent
    onContact?: () => void
}

export function AgentCard({ agent, onContact }: AgentCardProps) {
    const whatsappLink = agent.whatsapp
        ? `https://wa.me/${agent.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent("Hi, I found you on Landsale.lk and would like to discuss a property.")}`
        : null

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                    {/* Avatar Section */}
                    <div className="sm:w-1/3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-6 flex flex-col items-center justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                                <Image
                                    src={agent.avatar || "/placeholder-avatar.jpg"}
                                    alt={agent.name}
                                    width={96}
                                    height={96}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            {agent.isVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold">{agent.rating.toFixed(1)}</span>
                            <span className="text-muted-foreground text-sm">({agent.reviewCount})</span>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                            {agent.dealsCount} deals closed
                        </p>
                    </div>

                    {/* Info Section */}
                    <div className="sm:w-2/3 p-6 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                                    {agent.name}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    {agent.experience} years experience
                                </p>
                            </div>
                            {agent.isVerified && <VerifiedBadge variant="inline" />}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {agent.bio}
                        </p>

                        {/* Service Areas */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                            {agent.serviceAreas.slice(0, 3).map(area => (
                                <Badge key={area} variant="secondary" className="text-xs">
                                    {area}
                                </Badge>
                            ))}
                            {agent.serviceAreas.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{agent.serviceAreas.length - 3} more
                                </Badge>
                            )}
                        </div>

                        {/* Specializations */}
                        {agent.specializations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                                {agent.specializations.map(spec => (
                                    <Badge key={spec} variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200">
                                        {spec}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => window.open(`tel:${agent.phone}`, '_self')}
                            >
                                <Phone className="w-4 h-4 mr-2" /> Call
                            </Button>
                            {whatsappLink && (
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => window.open(whatsappLink, '_blank')}
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
