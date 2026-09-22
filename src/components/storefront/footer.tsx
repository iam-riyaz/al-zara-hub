import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Headphones, ShoppingBag } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
      {/* Trust Badges */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Free Express Shipping</h4>
                <p className="text-xs text-zinc-500 mt-1">Complimentary delivery on all orders exceeding $150</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">30-Day Hassle-Free Returns</h4>
                <p className="text-xs text-zinc-500 mt-1">Full refund guarantee within 30 days of delivery</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">256-Bit Encrypted Checkout</h4>
                <p className="text-xs text-zinc-500 mt-1">Bank-grade transaction security and data protection</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">24/7 Client Concierge</h4>
                <p className="text-xs text-zinc-500 mt-1">Dedicated product support whenever you need assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <ShoppingBag className="h-4.5 w-4.5" />
              </div>
              <span>Al-Zara Hub</span>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-sm">
              Al-Zara Hub is a curated commerce ecosystem combining artisanal craftsmanship, cutting-edge consumer electronics, and timeless apparel into a seamless shopping experience.
            </p>
            <div className="text-xs text-zinc-500">
              © {new Date().getFullYear()} Al-Zara Hub. Built for enterprise portfolio demonstration with zero paid dependencies.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">Shop</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/products" className="hover:text-emerald-600 transition-colors">All Products</Link></li>
              <li><Link href="/products?category=audio-headphones" className="hover:text-emerald-600 transition-colors">Audio & Headphones</Link></li>
              <li><Link href="/products?category=laptops-computers" className="hover:text-emerald-600 transition-colors">Laptops & Monitors</Link></li>
              <li><Link href="/products?category=fashion-apparel" className="hover:text-emerald-600 transition-colors">Fashion & Apparel</Link></li>
              <li><Link href="/products?category=home-living" className="hover:text-emerald-600 transition-colors">Home & Living</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/account" className="hover:text-emerald-600 transition-colors">My Profile</Link></li>
              <li><Link href="/account/orders" className="hover:text-emerald-600 transition-colors">Order Tracking</Link></li>
              <li><Link href="/wishlist" className="hover:text-emerald-600 transition-colors">My Wishlist</Link></li>
              <li><Link href="/cart" className="hover:text-emerald-600 transition-colors">Cart</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">Stay Connected</h5>
            <p className="text-xs text-zinc-500 mb-3">Subscribe for product drops, insider discounts, and private sales.</p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full text-xs h-9 px-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                className="w-full h-9 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
              >
                Join Newsletter
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
