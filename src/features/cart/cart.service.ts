import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { NotFoundError, InventoryError, ValidationError } from "@/lib/errors/AppError";
import { CartStatus } from "@prisma/client";

const GUEST_CART_COOKIE = "alzara_guest_cart";

export class CartService {
  /**
   * Resolve or initialize the active cart for either the logged-in user or guest session.
   */
  static async getOrCreateActiveCart() {
    const session = await getSession();
    const cookieStore = await cookies();

    if (session?.userId) {
      let userCart = await prisma.cart.findUnique({
        where: { userId: session.userId },
      });

      if (!userCart) {
        userCart = await prisma.cart.create({
          data: {
            userId: session.userId,
            status: CartStatus.ACTIVE,
          },
        });
      }
      return userCart;
    }

    // Guest Cart
    let guestSessionId = cookieStore.get(GUEST_CART_COOKIE)?.value;

    if (!guestSessionId) {
      guestSessionId = "guest_" + crypto.randomUUID();
      cookieStore.set(GUEST_CART_COOKIE, guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    let guestCart = await prisma.cart.findUnique({
      where: { guestSessionId },
    });

    if (!guestCart) {
      guestCart = await prisma.cart.create({
        data: {
          guestSessionId,
          status: CartStatus.ACTIVE,
        },
      });
    }

    return guestCart;
  }

  /**
   * Get formatted cart with recalculation of prices from DB
   */
  static async getCart() {
    const cart = await this.getOrCreateActiveCart();

    const fullCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    taxRate: true,
                    images: { orderBy: { sortOrder: "asc" }, take: 1 },
                  },
                },
                inventory: { select: { availableQuantity: true } },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!fullCart) return null;

    // Server-side canonical calculations (never trust client)
    let subtotal = 0;
    let totalTax = 0;

    const formattedItems = fullCart.items.map((item) => {
      const unitPrice = Number(item.variant.price);
      const itemSubtotal = unitPrice * item.quantity;
      const taxRate = Number(item.variant.product.taxRate || 0.08);
      const itemTax = itemSubtotal * taxRate;

      subtotal += itemSubtotal;
      totalTax += itemTax;

      return {
        id: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemSubtotal,
        product: {
          id: item.variant.product.id,
          name: item.variant.product.name,
          slug: item.variant.product.slug,
          variantTitle: item.variant.title,
          sku: item.variant.sku,
          image: item.variant.product.images[0]?.url,
        },
        availableQuantity: item.variant.inventory?.availableQuantity ?? 0,
        isOutOfStock: (item.variant.inventory?.availableQuantity ?? 0) < item.quantity,
      };
    });

    const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.0;
    const finalTotal = subtotal + totalTax + shipping;

    return {
      id: fullCart.id,
      items: formattedItems,
      itemCount: formattedItems.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(totalTax * 100) / 100,
      shippingAmount: shipping,
      totalAmount: Math.round(finalTotal * 100) / 100,
    };
  }

  /**
   * Add variant to cart with stock validation
   */
  static async addItem(variantId: string, quantity: number) {
    if (quantity < 1) throw new ValidationError("Quantity must be at least 1");

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: true },
    });

    if (!variant) throw new NotFoundError("Variant not found");

    const available = variant.inventory?.availableQuantity ?? 0;
    if (available < quantity) {
      throw new InventoryError(`Cannot add ${quantity} items. Only ${available} available.`);
    }

    const cart = await this.getOrCreateActiveCart();

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (available < newQty) {
        throw new InventoryError(`Total cart quantity (${newQty}) exceeds available stock (${available})`);
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        },
      });
    }

    return this.getCart();
  }

  /**
   * Update quantity of existing cart item
   */
  static async updateQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(cartItemId);
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { variant: { include: { inventory: true } } },
    });

    if (!cartItem) throw new NotFoundError("Cart item not found");

    const available = cartItem.variant.inventory?.availableQuantity ?? 0;
    if (available < quantity) {
      throw new InventoryError(`Requested quantity (${quantity}) exceeds available stock (${available})`);
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return this.getCart();
  }

  /**
   * Remove item from cart
   */
  static async removeItem(cartItemId: string) {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
    return this.getCart();
  }

  /**
   * Merge guest cart into user cart upon login
   */
  static async mergeGuestCart(userId: string) {
    const cookieStore = await cookies();
    const guestSessionId = cookieStore.get(GUEST_CART_COOKIE)?.value;
    if (!guestSessionId) return;

    const guestCart = await prisma.cart.findUnique({
      where: { guestSessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { userId, status: CartStatus.ACTIVE },
      });
    }

    // Merge each item into userCart
    for (const item of guestCart.items) {
      const existingUserItem = await prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: userCart.id,
            variantId: item.variantId,
          },
        },
      });

      if (existingUserItem) {
        await prisma.cartItem.update({
          where: { id: existingUserItem.id },
          data: { quantity: existingUserItem.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            variantId: item.variantId,
            quantity: item.quantity,
          },
        });
      }
    }

    // Mark guest cart as merged and clear cookie
    await prisma.cart.update({
      where: { id: guestCart.id },
      data: { status: CartStatus.MERGED },
    });
    cookieStore.delete(GUEST_CART_COOKIE);
  }
}
