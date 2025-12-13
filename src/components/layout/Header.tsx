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
        { href: "/agents", label: "Agents" },
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
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] border-t-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)]">
                            <SheetHeader className="text-left mb-6 px-2">
                                <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent inline-block">
                                    LandSale.lk
                                </SheetTitle>
                                <SheetDescription className="text-base text-muted-foreground/80">
                                    Find your dream property in Sri Lanka
                                </SheetDescription>
                            </SheetHeader>

                            <nav className="flex flex-col gap-2 px-2">
                                <Button
                                    asChild
                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 h-12 text-base font-semibold rounded-xl mb-4 w-full justify-start pl-4"
                                >
                                    <Link href="/dashboard/post-ad">
                                        <PlusCircle className="mr-3 h-5 w-5" /> Post Your Ad
                                    </Link>
                                </Button>

                                <div className="space-y-1">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center p-4 rounded-xl transition-all duration-200",
                                                pathname === item.href
                                                    ? "bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold"
                                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                                            )}
                                        >
                                            {/* Icon Logic based on label */}
                                            {item.label === 'Home' && <span className="mr-4"><div className="w-2 h-2 rounded-full bg-current" /></span>}
                                            {item.label === 'Properties' && <span className="mr-4 text-xl">🏠</span>}
                                            {item.label === 'About Us' && <span className="mr-4 text-xl">ℹ️</span>}
                                            {item.label === 'Contact' && <span className="mr-4 text-xl">📞</span>}

                                            {item.label}
                                        </Link>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                                    {user ? (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-3 p-2">
                                                <Avatar className="h-10 w-10 border-2 border-emerald-500/20">
                                                    <AvatarImage src={(user.prefs as any)?.avatar_url} />
                                                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm text-foreground">{user.name || 'User'}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" className="justify-start h-10 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900" asChild>
                                                    <Link href="/dashboard">Dashboard</Link>
                                                </Button>
                                                <Button variant="outline" className="justify-start h-10 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900" asChild>
                                                    <Link href="/dashboard/my-ads">My Ads</Link>
                                                </Button>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                onClick={handleSignOut}
                                                className="justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                            >
                                                Sign out
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <Button variant="outline" className="h-12 border-slate-200 dark:border-slate-800 text-base" asChild>
                                                <Link href="/login">Log in</Link>
                                            </Button>
                                            <Button className="h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-base" asChild>
                                                <Link href="/signup">Sign up</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}