import { prisma } from "@/lib/db/prisma";
import { ProductFilterParams, PaginatedResult } from "./product.types";
import { ProductStatus, Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/errors/AppError";

export class ProductService {
  static async list(params: ProductFilterParams): Promise<PaginatedResult<any>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
    };

    // Keyword Search across name, description, SKU, and brand
    if (params.search?.trim()) {
      const search = params.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    // Category Filter (includes child categories if parent is selected)
    if (params.categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: params.categorySlug },
        include: { children: { select: { id: true } } },
      });

      if (category) {
        const categoryIds = [category.id, ...category.children.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      }
    }

    // Brand Filter
    if (params.brand) {
      where.brand = params.brand;
    }

    // Price Bounds
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.basePrice = {};
      if (params.minPrice !== undefined) where.basePrice.gte = params.minPrice;
      if (params.maxPrice !== undefined) where.basePrice.lte = params.maxPrice;
    }

    // Minimum Rating
    if (params.minRating !== undefined && params.minRating > 0) {
      where.ratingAverage = { gte: params.minRating };
    }

    // In-Stock Only filter
    if (params.inStockOnly) {
      where.variants = {
        some: {
          inventory: {
            availableQuantity: { gt: 0 },
          },
        },
      };
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    switch (params.sortBy) {
      case "price-asc":
        orderBy = { basePrice: "asc" };
        break;
      case "price-desc":
        orderBy = { basePrice: "desc" };
        break;
      case "rating-desc":
        orderBy = { ratingAverage: "desc" };
        break;
      case "name-asc":
        orderBy = { name: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: {
            orderBy: { sortOrder: "asc" },
            take: 2,
          },
          variants: {
            select: {
              id: true,
              sku: true,
              price: true,
              compareAtPrice: true,
              inventory: { select: { availableQuantity: true } },
            },
            take: 1,
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  static async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent: { select: { id: true, name: true, slug: true } },
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
        options: {
          orderBy: { position: "asc" },
          include: {
            values: { orderBy: { position: "asc" } },
          },
        },
        variants: {
          include: {
            inventory: true,
            optionValues: {
              include: { optionValue: true },
            },
          },
        },
        reviews: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!product || product.status === ProductStatus.ARCHIVED) {
      throw new NotFoundError(`Product with slug "${slug}" not found`);
    }

    return product;
  }

  static async getFeatured(limit = 8) {
    return prisma.product.findMany({
      where: { status: ProductStatus.ACTIVE },
      orderBy: [{ ratingAverage: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 2,
        },
      },
    });
  }

  static async getRelated(productId: string, categoryId: string, limit = 4) {
    return prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        categoryId,
        id: { not: productId },
      },
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });
  }
}
