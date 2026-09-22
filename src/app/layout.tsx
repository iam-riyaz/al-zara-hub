import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { CartProvider } from "@/features/cart/cart-context";
import { WishlistProvider } from "@/features/wishlist/wishlist-context";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Al-Zara Hub | Modern Luxury E-Commerce & Curated Essentials",
  description: "Enterprise-grade portfolio e-commerce platform offering premium audio, high-performance computing, contemporary fashion, and smart home living.",
  keywords: ["e-commerce", "headphones", "laptops", "fashion", "smart home", "audio", "al-zara"],
  authors: [{ name: "Al-Zara Architecture Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CartProvider>
            <WishlistProvider>
              <Header currentUser={currentUser} />
              <main className="flex-1">{children}</main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
