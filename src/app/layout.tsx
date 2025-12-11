import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";
import { BackToTop } from "@/components/ui/back-to-top";
import { MobileActionDock } from "@/components/layout/MobileActionDock";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AISupportButton } from "@/components/ai-chat/AISupportButton";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://landsale.lk";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "LandSale.lk | Real Estate Marketplace Sri Lanka",
    template: "%s | LandSale.lk",
  },
  description: "Find your dream land, house, or commercial property in Sri Lanka. The most trusted platform for buying and selling real estate with 10,000+ listings.",
  keywords: [
    "Sri Lanka real estate",
    "land for sale",
    "property Sri Lanka",
    "buy land",
    "sell property",
    "houses for sale",
    "commercial property",
    "LandSale.lk",
    "real estate marketplace"
  ],
  authors: [{ name: "LandSale.lk" }],
  creator: "LandSale.lk",
  publisher: "LandSale.lk",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_LK",
    siteName: "LandSale.lk",
    title: "LandSale.lk | Real Estate Marketplace Sri Lanka",
    description: "Find your dream land, house, or commercial property in Sri Lanka. The most trusted platform for buying and selling real estate.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LandSale.lk | Real Estate Marketplace Sri Lanka",
    description: "Find your dream land, house, or commercial property in Sri Lanka.",
    creator: "@landsalelk",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col pb-16 md:pb-0">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster richColors position="top-right" />
          <BackToTop />
          <MobileActionDock />
          <MobileBottomNav />
          <AISupportButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
