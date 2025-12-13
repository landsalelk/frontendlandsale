"use client";

import { Sparkles, Bot } from 'lucide-react';

const TIPS: Record<string, string> = {
    "homagama": "RealtyOS Analysis: Homagama is becoming a major education and tech hub. Land prices are projected to double in the next 3 years due to university expansions.",
    "kaduwela": "RealtyOS Analysis: Proximity to the Highway entrance makes Kaduwela a prime logistics and residential hotspot. Excellent rental yield potential.",
    "malabe": "RealtyOS Analysis: The 'IT Hub' of Sri Lanka. High demand from tech professionals ensures consistent property appreciation.",
    "default": "RealtyOS Analysis: This area shows steady growth. Investing in land here is a safe hedge against inflation."
};

interface AiInvestmentTipProps {
    city: string;
}

export default function AiInvestmentTip({ city }: AiInvestmentTipProps) {
    const cityKey = city.toLowerCase().trim();
    const tip = TIPS[cityKey] || TIPS["default"];

    return (
        <div className="mt-4 p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 relative overflow-hidden">
            {/* Abstract BG */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="flex gap-3 relative z-10">
                <div className="bg-emerald-500/20 p-2 rounded-lg h-fit">
                    <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-emerald-400 mb-1 flex items-center gap-1">
                        AI Investment Advisor
                        <Sparkles className="w-3 h-3" />
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {tip}
                    </p>
                </div>
            </div>
        </div>
    );
}
