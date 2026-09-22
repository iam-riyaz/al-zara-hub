import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/rbac";
import { AuditService } from "@/features/audit/audit.service";
import { ProductStatus, VariantStatus, InventoryTransactionType } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required"),
  sku: z.string().min(2, "SKU is required"),
  brand: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  basePrice: z.number().min(0.01, "Price must be greater than 0"),
  compareAtPrice: z.number().optional(),
  costPrice: z.number().optional(),
  taxRate: z.number().min(0).max(1).default(0.08),
  description: z.string().min(10, "Description must be at least 10 chars"),
  shortDescription: z.string().optional(),
  initialStock: z.number().int().min(0).default(10),
  imageUrl: z.string().url().default("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        variants: {
          include: { inventory: true },
        },
        images: { take: 1 },
      },
    });

    return successResponse(products);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const body = await request.json();
    const input = createProductSchema.parse(body);

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: input.name,
          slug: input.slug.toLowerCase().trim(),
          sku: input.sku.toUpperCase().trim(),
          brand: input.brand,
          categoryId: input.categoryId,
          basePrice: input.basePrice,
          compareAtPrice: input.compareAtPrice,
          costPrice: input.costPrice,
          taxRate: input.taxRate,
          description: input.description,
          shortDescription: input.shortDescription,
          status: ProductStatus.ACTIVE,
          images: {
            create: {
              url: input.imageUrl,
              altText: input.name,
              isPrimary: true,
            },
          },
        },
      });

      // Create default standard variant and inventory
      await tx.productVariant.create({
        data: {
          productId: created.id,
          sku: `${input.sku}-STD`,
          title: "Standard Edition",
          price: input.basePrice,
          compareAtPrice: input.compareAtPrice,
          status: VariantStatus.ACTIVE,
          inventory: {
            create: {
              availableQuantity: input.initialStock,
              reservedQuantity: 0,
              soldQuantity: 0,
              lowStockThreshold: 5,
              transactions: {
                create: {
                  type: InventoryTransactionType.RESTOCK,
                  quantity: input.initialStock,
                  referenceType: "PRODUCT_CREATED",
                  notes: "Initial inventory allocation",
                },
              },
            },
          },
        },
      });

      return created;
    });

    // Record Audit Log
    await AuditService.log({
      actorId: adminUser.id,
      action: "PRODUCT_CREATED",
      entityType: "PRODUCT",
      entityId: product.id,
      newValue: { name: product.name, sku: product.sku, basePrice: input.basePrice },
    });

    return successResponse(product, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
