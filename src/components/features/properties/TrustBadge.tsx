"use client";

import { ShieldCheck, CheckCircle2, FileText, UserCheck, Gavel } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';

export default function TrustBadge() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent group">
                    <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer gap-1.5 px-3 py-1">
                        <ShieldCheck className="w-3.5 h-3.5 fill-emerald-100" />
                        Verified Listing
                    </Badge>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-emerald-700">
                        <ShieldCheck className="w-6 h-6" />
                        LandSale Verified Safety Check
                    </DialogTitle>
                    <DialogDescription>
                        This property has passed our preliminary safety screening.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Clear Deed (Sinnakkara)</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Initial verification indicates a clear title deed structure.
                            </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <Gavel className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">No Encumbrances</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Checked against major liens and bank mortgages.
                            </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <UserCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Owner Identity Verified</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Seller's NIC and contact details have been authenticated.
                            </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                    </div>
                </div>

                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-md">
                    <strong>Disclaimer:</strong> This is a preliminary check. We always recommend hiring your own notary for final verification.
                </div>
            </DialogContent>
        </Dialog>
    );
}
