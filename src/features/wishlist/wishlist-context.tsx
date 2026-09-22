"use client";

import * as React from "react";

interface WishlistContextType {
  wishlistIds: Set<string>;
  wishlistCount: number;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isWishlisted: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = React.createContext<WishlistContextType>({
  wishlistIds: new Set(),
  wishlistCount: 0,
  toggleWishlist: async () => false,
  isWishlisted: () => false,
  refreshWishlist: async () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = React.useState<Set<string>>(new Set());

  const refreshWishlist = React.useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.items) {
          const ids = new Set<string>(data.data.items.map((it: any) => it.productId));
          setWishlistIds(ids);
        }
      }
    } catch {
      // ignore unauthenticated or network hiccups
    }
  }, []);

  React.useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isWishlisted = (productId: string) => wishlistIds.has(productId);

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    const currentlySaved = wishlistIds.has(productId);
    const updated = new Set(wishlistIds);
    if (currentlySaved) {
      updated.delete(productId);
    } else {
      updated.add(productId);
    }
    setWishlistIds(updated);

    try {
      const res = await fetch("/api/wishlist", {
        method: currentlySaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        // Rollback on failure
        setWishlistIds(wishlistIds);
        return false;
      }
      return !currentlySaved;
    } catch {
      setWishlistIds(wishlistIds);
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.size,
        toggleWishlist,
        isWishlisted,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return React.useContext(WishlistContext);
}
