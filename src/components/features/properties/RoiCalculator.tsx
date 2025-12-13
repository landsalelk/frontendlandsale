"use client";

import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Mock growth rates - reuse same logic or expanded map
const GROWTH_RATES: Record<string, number> = {
    "homagama": 12.5,
    "kaduwela": 15.2,
    "malabe": 18.0,
    "gampaha": 8.5,
    "kurunegala": 7.2,
    "colombo": 5.1,
    "default": 8.0
};

interface RoiCalculatorProps {
    price: number; // in LKR (cents or base unit depending on input, assume standard units for calculation if formatted)
    city: string;
}

export default function RoiCalculator({ price, city }: RoiCalculatorProps) {
    const [years, setYears] = useState([5]);

    // Normalize city
    const growthRate = GROWTH_RATES[city.toLowerCase().trim()] || GROWTH_RATES["default"];

    const projectedValue = useMemo(() => {
        // Compound interest: A = P(1 + r/100)^t
        return Math.floor(price * Math.pow((1 + growthRate / 100), years[0]));
    }, [price, growthRate, years]);

    const profit = projectedValue - price;

    // Assume price is in Rs (not cents) or handle formatting correctly. 
    // Based on previous files, `formatPrice` handles large numbers nicely.

    return (
        <Card className="bg-emerald-950 text-emerald-50 border-emerald-800 overflow-hidden shadow-xl">
            <CardHeader className="pb-2 bg-emerald-900/50">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-100">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    See Your Profit Potential
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">

                {/* Years Slider */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm text-emerald-200/80">
                        <span>Hold for...</span>
                        <span className="font-bold text-white">{years[0]} Years</span>
                    </div>
                    <Slider
                        value={years}
                        onValueChange={setYears}
                        max={10}
                        min={1}
                        step={1}
                        className="cursor-pointer"
                    />
                </div>

                {/* Results */}
                <div className="bg-emerald-900/40 rounded-xl p-4 border border-emerald-800/50 space-y-2 text-center">
                    <div className="text-sm text-emerald-300">Projected Value ({growthRate}% growth/yr)</div>
                    <div className="text-3xl font-bold text-yellow-400">
                        LKR {formatPrice(projectedValue)}
                    </div>
                    <div className="text-emerald-100/60 text-xs flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Pure Profit: +LKR {formatPrice(profit)}
                    </div>
                </div>

                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold">
                    Invest Now
                </Button>
            </CardContent>
        </Card>
    );
}
