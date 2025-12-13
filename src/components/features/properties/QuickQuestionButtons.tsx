"use client"

import { Button } from "@/components/ui/button"
import { MessageCircleQuestion } from "lucide-react"

import { notifySellerOfInterest } from "@/lib/actions/notifications"

interface QuickQuestionButtonsProps {
    phone: string
    title: string
    sellerId: string
    propertyId: string
}

export function QuickQuestionButtons({ phone, title, sellerId, propertyId }: QuickQuestionButtonsProps) {
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '94'); // Format for Sri Lanka if needed or generic

    // Safety check
    if (!cleanPhone) return null;

    const questions = [
        "Is this still available?",
        "Is the price negotiable?",
        "Can I visit this weekend?"
    ]

    const handleAsk = async (question: string) => {
        // 1. Open WhatsApp immediately (Low friction for buyer)
        const text = `Hi, I saw your ad on LandSale.lk regarding "${title}". ${question}`;
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');

        // 2. Notify Seller (Async, non-blocking)
        try {
            await notifySellerOfInterest({
                sellerId,
                propertyId,
                propertyTitle: title,
                actionType: 'whatsapp'
            })
        } catch (e) {
            console.error("Failed to notify seller", e)
        }
    }

    return (
        <div className="space-y-2 mt-4">
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <MessageCircleQuestion className="w-3 h-3" /> Quick Ask:
            </p>
            <div className="flex flex-col gap-2">
                {questions.map((q, i) => (
                    <Button
                        key={i}
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8 text-xs bg-muted/50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-transparent hover:border-emerald-200"
                        onClick={() => handleAsk(q)}
                    >
                        {q}
                    </Button>
                ))}
            </div>
        </div>
    )
}
