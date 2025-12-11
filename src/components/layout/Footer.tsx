import Link from "next/link"
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">LandSale.lk</h3>
                        <p className="text-sm text-muted-foreground">
                            Sri Lanka's premier marketplace for lands, homes, and commercial properties. Connecting buyers and sellers with trust.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Properties</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/search?type=land" className="hover:text-primary">Lands for Sale</Link></li>
                            <li><Link href="/search?type=house" className="hover:text-primary">Houses for Sale</Link></li>
                            <li><Link href="/search?type=commercial" className="hover:text-primary">Commercial Property</Link></li>
                            <li><Link href="/search?type=rent" className="hover:text-primary">Rentals</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Connect</h4>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            © {new Date().getFullYear()} LandSale.lk. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
