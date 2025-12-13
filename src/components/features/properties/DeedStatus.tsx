"use client";

import { FileCheck, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeedStatusProps {
    deedType?: string; // e.g. "Sinnakkara", "Bim Saviya", "Jaya Boomi"
    bankLoan?: boolean;
}

export default function DeedStatus({ deedType = "Sinnakkara", bankLoan = true }: DeedStatusProps) {

    const isClearTitle = deedType.toLowerCase().includes("sinnakkara") || deedType.toLowerCase().includes("freehold");

    return (
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-slate-800">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                Legal & Deed Status
            </h4>

            <div className="space-y-2">
                {/* Deed Type */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-1">
                        Deed Type
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p><strong>Sinnakkara (Freehold):</strong> Absolute ownership. Best for bank loans.</p>
                                    <p className="mt-1"><strong>Bim Saviya:</strong> Electronic Govt Title.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </span>
                    <span className={`font-medium flex items-center gap-1 ${isClearTitle ? "text-emerald-700" : "text-amber-600"}`}>
                        {isClearTitle ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {deedType || "Not Specified"}
                    </span>
                </div>

                {/* Loans */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-1">
                        Bank Loans
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>Major banks require Clear Titles (Sinnakkara) or First Class Bim Saviya.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </span>
                    {bankLoan ? (
                        <span className="font-medium text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> obtainable
                        </span>
                    ) : (
                        <span className="font-medium text-amber-600 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Verify
                        </span>
                    )}
                </div>
                {/* Bim Saviya */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-1">
                        Bim Saviya
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>Electronic title registration system in Sri Lanka guaranteeing ownership.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </span>
                    <span className="font-medium text-slate-700 font-mono text-xs bg-slate-200 px-2 py-0.5 rounded">
                        Check Required
                    </span>
                </div>
            </div>

            <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200 bg-slate-50/50 italic">
                "Transparency Pledge: We verify basic documents, but always recommend your own lawyer."
            </div>
        </div>
    );
}
