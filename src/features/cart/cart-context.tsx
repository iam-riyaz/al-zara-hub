"use client";

import * as React from "react";

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  setCartCount: (count: number) => void;
}

const CartContext = React.createContext<CartContextType>({
  cartCount: 0,
  refreshCart: async () => {},
  setCartCount: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = React.useState(0);

  const refreshCart = React.useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.items) {
          const totalQty = data.data.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
          setCartCount(totalQty);
        }
      }
    } catch {
      // ignore guest/network hiccups
    }
  }, []);

  React.useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, setCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return React.useContext(CartContext);
}
