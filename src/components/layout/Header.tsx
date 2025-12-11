"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, User, PlusCircle } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { getAccount } from "@/lib/appwrite/client"
import { Models } from "appwrite"

export function Header() {
    const pathname = usePathname()
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)

    useEffect(() => {
        const getUser = async () => {
            try {
                const account = getAccount()
                const currentUser = await account.get()
                setUser(currentUser)
            } catch {
                setUser(null)
            }
        }
        getUser()
    }, [])

    const navItems = [
        { href: "/", label: "Home" },
        { href: "/properties", label: "Properties" },
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact" },
    ]

    const handleSignOut = async () => {
        try {
            const account = getAccount()
            await account.deleteSession('current')
            setUser(null)
            window.location.href = '/'
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 border-white/20 dark:border-white/10 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">LandSale.lk</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "transition-colors hover:text-foreground/80",
                                    pathname === item.href ? "text-foreground" : "text-foreground/60"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="default" className="hidden md:flex bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                        <Link href="/dashboard/post-ad">
                            <PlusCircle className="mr-2 h-4 w-4" /> Post Your Ad
                        </Link>
                    </Button>

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="cursor-pointer">
                                    <AvatarImage src={(user.prefs as any)?.avatar_url} />
                                    <AvatarFallback>{user.email?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/dashboard/my-ads">My Ads</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/dashboard/settings">Settings</Link></DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">Sign out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant="ghost" asChild>
                                <Link href="/login">Log in</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/signup">Sign up</Link>
                            </Button>
                        </div>
                    )}

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="md:hidden" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[50vh] rounded-t-3xl">
                            <SheetHeader>
                                <SheetTitle>Navigation Menu</SheetTitle>
                                <SheetDescription>
                                    Access all pages and account options
                                </SheetDescription>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 mt-8">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="text-lg font-medium hover:text-primary transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                {!user && (
                                    <div className="flex flex-col gap-2 mt-4">
                                        <Button variant="outline" asChild><Link href="/login">Log in</Link></Button>
                                        <Button asChild><Link href="/signup">Sign up</Link></Button>
                                    </div>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}