import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <li>
                    <Link
                        href="/"
                        className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                        aria-label="Home"
                    >
                        <Home className="h-4 w-4" />
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        {item.href && index < items.length - 1 ? (
                            <Link
                                href={item.href}
                                className="hover:text-emerald-600 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                className="text-foreground font-medium truncate max-w-[200px]"
                                aria-current={index === items.length - 1 ? "page" : undefined}
                            >
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}
