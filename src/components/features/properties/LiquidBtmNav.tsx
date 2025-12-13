"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useVelocity, useTransform, useSpring } from "framer-motion";
import { Phone, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiquidBtmNavProps {
    price: string;
    phone: string;
    whatsapp?: string;
    sellerId: string;
    propertyId: string;
    propertyTitle: string;
}

import { notifySellerOfInterest } from "@/lib/actions/notifications";

export default function LiquidBtmNav({ price, phone, whatsapp, sellerId, propertyId, propertyTitle }: LiquidBtmNavProps) {
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);

    // Smooth out velocity to avoid jitter
    const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

    const [isUrgentMode, setIsUrgentMode] = useState(false);

    useEffect(() => {
        return smoothVelocity.on("change", (latest) => {
            const speed = Math.abs(latest);
            // If scrolling fast (> 1000px/s), switch to Urgent (Compact) Mode
            if (speed > 800) {
                setIsUrgentMode(true);
            }
            // If stopped or very slow, switch back to Relationship (Expanded) Mode
            else if (speed < 100) {
                setIsUrgentMode(false);
            }
        });
    }, [smoothVelocity]);

    const handleAction = async (type: 'call' | 'whatsapp') => {
        try {
            await notifySellerOfInterest({
                sellerId,
                propertyId,
                propertyTitle,
                actionType: type
            })
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <motion.div
            className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
        >
            <motion.div
                className={`bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-full overflow-hidden pointer-events-auto transition-all duration-300 ease-in-out ${isUrgentMode ? 'px-4 py-2 opacity-90 scale-95' : 'px-6 py-3 opacity-100 scale-100'}`}
                layout
            >
                {isUrgentMode ? (
                    // URGENT MODE: Just Price + Call Icon (Minimal distraction)
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">{price}</span>
                        <div className="h-4 w-px bg-slate-300" />
                        <Button size="icon" className="h-8 w-8 rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAction('call')} asChild>
                            <a href={`tel:${phone}`}>
                                <Phone className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                ) : (
                    // RELATIONSHIP MODE: Full options (Relaxed)
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block mr-2">
                            <span className="text-xs text-muted-foreground block">Asking Price</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{price}</span>
                        </div>

                        <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-6" onClick={() => handleAction('call')} asChild>
                            <a href={`tel:${phone}`}>
                                <Phone className="mr-2 h-4 w-4" /> Call Seller
                            </a>
                        </Button>

                        {whatsapp && (
                            <Button variant="outline" size="icon" className="rounded-full border-green-500 text-green-600 hover:bg-green-50" onClick={() => handleAction('whatsapp')} asChild>
                                <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="h-4 w-4" />
                                </a>
                            </Button>
                        )}

                        <Button variant="ghost" size="icon" className="rounded-full" title="Schedule Visit">
                            <Calendar className="h-4 w-4 text-slate-500" />
                        </Button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
