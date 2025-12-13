"use client";
import { useState, useEffect } from 'react';
import { Bell, TrendingUp, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have standard utils

const ALERTS = [
    { icon: TrendingUp, text: "High demand! 15 people viewed this property in the last hour.", color: "text-blue-600", bg: "bg-blue-100" },
    { icon: Calendar, text: "A site visit was just scheduled for this property.", color: "text-emerald-600", bg: "bg-emerald-100" },
    { icon: Bell, text: "Price is 10% lower than similar properties in this area.", color: "text-amber-600", bg: "bg-amber-100" },
];

export default function SmartNotification() {
    const [visible, setVisible] = useState(false);
    const [alert, setAlert] = useState(ALERTS[0]);

    useEffect(() => {
        // Show after 15-45 seconds
        const delay = Math.random() * 30000 + 15000;

        const timer = setTimeout(() => {
            // Pick random alert
            setAlert(ALERTS[Math.floor(Math.random() * ALERTS.length)]);
            setVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className={cn(
            "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50",
            "bg-white rounded-lg shadow-2xl border border-slate-100 p-4",
            "transform transition-all duration-500 ease-out translate-y-0 opacity-100",
            "animate-in slide-in-from-bottom-5 fade-in"
        )}>
            <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-full shrink-0", alert.bg)}>
                    <alert.icon className={cn("w-5 h-5", alert.color)} />
                </div>

                <div className="flex-1">
                    <p className="text-sm text-slate-700 font-medium leading-snug">
                        {alert.text}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Just now</p>
                </div>

                <button
                    onClick={() => setVisible(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
