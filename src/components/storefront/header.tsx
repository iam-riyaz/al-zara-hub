"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart, Search, User, LogOut, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useCart } from "@/features/cart/cart-context";
import { useWishlist } from "@/features/wishlist/wishlist-context";

interface HeaderProps {
  currentUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
}

export function Header({ currentUser }: HeaderProps) {
  const router = useRouter();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
      {/* Top Banner */}
      <div className="bg-emerald-700 text-white text-xs font-medium py-1.5 px-4 text-center tracking-wide">
        Free Worldwide Express Shipping on Orders Over $150 • Use Code: <span className="font-bold underline">WELCOME10</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Al-Zara<span className="text-emerald-600 dark:text-emerald-400">.</span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search audio, laptops, clothing, smart home..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9.5 pl-9 pr-4 text-sm bg-zinc-100 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-full focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            <Link href="/products" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Shop All
            </Link>
            <Link href="/categories" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Categories
            </Link>
            <Link href="/products?sortBy=rating-desc" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Featured
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />

            {/* Wishlist Link */}
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative" aria-label="Wishlist">
                <Heart className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart Link */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative" aria-label="Shopping Cart">
                <ShoppingBag className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Account / Auth */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                {(currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Admin</span>
                    </Button>
                  </Link>
                )}
                <Link href="/account">
                  <Button variant="ghost" size="sm" className="text-xs font-semibold">
                    {currentUser.firstName}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="text-zinc-500 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="hidden sm:inline-flex text-xs">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-sm bg-zinc-100 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
            </form>
            <nav className="flex flex-col space-y-2 pt-2 text-sm font-medium">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
              >
                Shop All Products
              </Link>
              <Link
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
              >
                Browse Categories
              </Link>
              <Link
                href="/products?sortBy=rating-desc"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
              >
                Top Rated
              </Link>
              {currentUser && (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 px-2 text-amber-600 dark:text-amber-400 font-semibold"
                >
                  Admin Portal
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
