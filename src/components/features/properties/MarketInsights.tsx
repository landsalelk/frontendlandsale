"use client";

import { TrendingUp, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock Data Source - In a real app, this would come from an API or DB
const CITY_DATA: Record<string, { growth: number; period: string; density: string; demand: "High" | "Medium" | "Very High" }> = {
    "homagama": { growth: 12.5, period: "5 years", density: "Rapidly Increasing", demand: "Very High" },
    "kaduwela": { growth: 15.2, period: "5 years", density: "High", demand: "Very High" },
    "malabe": { growth: 18.0, period: "5 years", density: "Very High", demand: "Very High" },
    "gampaha": { growth: 8.5, period: "5 years", density: "Medium", demand: "High" },
    "kurunegala": { growth: 7.2, period: "5 years", density: "Medium", demand: "High" },
    "colombo": { growth: 5.1, period: "5 years", density: "Saturated", demand: "High" },
};

interface MarketInsightsProps {
    city: string;
    district: string;
}

export default function MarketInsights({ city, district }: MarketInsightsProps) {
    // Normalize checking
    const cityKey = city.toLowerCase().trim();
    const data = CITY_DATA[cityKey];

    if (!data) return null; // Don't show if we have no unique data

    return (
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        Market Insights: {city}
                    </CardTitle>
                    {data.demand === "Very High" && (
                        <Badge className="bg-indigo-600 hover:bg-indigo-700 animate-pulse">
                            🔥 Hot Area
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Main Stat */}
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100 text-center min-w-[100px]">
                            <div className="text-2xl font-bold text-indigo-600">+{data.growth}%</div>
                            <div className="text-xs text-slate-500">Population</div>
                        </div>
                        <div className="text-sm text-slate-700">
                            <span className="font-semibold">{city}</span> has seen a
                            <span className="font-semibold text-indigo-700"> {data.growth}% population growth</span> over the last {data.period}.
                            Higher density means higher land value!
                        </div>
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white/60 p-2 rounded-lg border border-indigo-50/50 flex flex-col items-center justify-center p-3">
                            <span className="text-slate-500 text-xs mb-1">Demand Score</span>
                            <span className="font-medium text-emerald-600 uppercase tracking-wider">{data.demand}</span>
                        </div>
                        <div className="bg-white/60 p-2 rounded-lg border border-indigo-50/50 flex flex-col items-center justify-center p-3">
                            <span className="text-slate-500 text-xs mb-1">Urban Density</span>
                            <span className="font-medium text-indigo-600">{data.density}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
