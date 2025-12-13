"use client";
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export default function LiveViewCounter() {
    const [viewCount, setViewCount] = useState(12);
    const [trend, setTrend] = useState<'up' | 'down'>('up');

    useEffect(() => {
        // Initial random count between 8 and 24
        setViewCount(Math.floor(Math.random() * 16) + 8);

        const interval = setInterval(() => {
            setViewCount(prev => {
                const change = Math.random() > 0.6 ? 1 : -1;
                const newCount = prev + change;

                // Keep within realistic bounds
                if (newCount < 5) return 5;
                if (newCount > 35) return 35;

                setTrend(change > 0 ? 'up' : 'down');
                return newCount;
            });
        }, 5000 + Math.random() * 5000); // Random update every 5-10 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-medium animate-pulse border border-red-100 w-fit">
            <Users className="w-4 h-4" />
            <span>
                <span className="font-bold">{viewCount} people</span> are viewing this right now
            </span>
        </div>
    );
}
