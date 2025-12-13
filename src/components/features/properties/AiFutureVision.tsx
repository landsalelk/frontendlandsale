"use client";
import { useState } from 'react';
import { Sparkles, Loader2, Home } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AiFutureVisionProps {
    propertyType: string;
    propertyTitle: string;
    location: string;
}

export default function AiFutureVision({ propertyType, propertyTitle, location }: AiFutureVisionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // Only show for lands for now (simplest "future" visualization)
    if (propertyType.toLowerCase() !== 'land') return null;

    const handleGenerate = () => {
        setIsOpen(true);
        if (!generatedImage) {
            setLoading(true);

            // Construct a prompt for a house on this specific land
            const prompt = `A stunning ultra-modern luxury house built on a land in ${location}, architectural visualization, high end, photorealistic, 8k, warm lighting, cinematic shot`;
            const encodedPrompt = encodeURIComponent(prompt);
            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&model=flux&seed=${Date.now()}`;

            // Artificial delay to make it feel like "processing" (and ensure image is ready)
            setTimeout(() => {
                setGeneratedImage(url);
                setLoading(false);
            }, 2000);
        }
    };

    return (
        <div className="my-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10">
                <h3 className="text-lg font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                    See the Potential!
                </h3>
                <p className="text-emerald-700/80 mb-4 text-sm max-w-md">
                    Curious what you could build here? Use our AI to visualize a dream home on this exact land.
                </p>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={handleGenerate}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Visualize Dream Home
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-xl border-white/20">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-emerald-900">
                                <Sparkles className="w-5 h-5 text-emerald-600" />
                                AI-Generated Future Vision
                            </DialogTitle>
                        </DialogHeader>

                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-inner relative flex items-center justify-center">
                            {loading ? (
                                <div className="flex flex-col items-center gap-3 text-emerald-600">
                                    <Loader2 className="w-10 h-10 animate-spin" />
                                    <span className="text-sm font-medium animate-pulse">Designing your dream home...</span>
                                </div>
                            ) : (
                                <img
                                    src={generatedImage!}
                                    alt="AI Future Vision"
                                    className="w-full h-full object-cover transition-all duration-700 animate-in fade-in zoom-in-95"
                                />
                            )}
                        </div>
                        <p className="text-xs text-center text-slate-500 mt-2">
                            *AI-generated concept art for visualization purposes only.
                        </p>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
