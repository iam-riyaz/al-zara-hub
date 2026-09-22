import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors/AppError";
import { CartService } from "../cart/cart.service";

export class WishlistService {
  static async getOrCreateWishlist(userId: string) {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
      });
    }

    return wishlist;
  }

  static async getWishlist(userId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    return prisma.wishlist.findUnique({
      where: { id: wishlist.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: "asc" }, take: 1 },
                variants: {
                  include: { inventory: true },
                  take: 1,
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  static async addItem(userId: string, productId: string, variantId?: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundError("Product not found");

    const existing = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    if (!existing) {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
          variantId,
        },
      });
    }

    return this.getWishlist(userId);
  }

  static async removeItem(userId: string, productId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return this.getWishlist(userId);
  }

  static async moveToCart(userId: string, productId: string, variantId?: string) {
    let chosenVariantId = variantId;

    if (!chosenVariantId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { variants: true },
      });
      chosenVariantId = product?.variants[0]?.id;
    }

    if (!chosenVariantId) {
      throw new NotFoundError("No purchasable variant available for this product");
    }

    // Add to cart
    await CartService.addItem(chosenVariantId, 1);

    // Remove from wishlist
    await this.removeItem(userId, productId);

    return { success: true };
  }
}
