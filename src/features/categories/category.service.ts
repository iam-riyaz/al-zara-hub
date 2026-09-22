import { prisma } from "@/lib/db/prisma";
import { CategoryStatus } from "@prisma/client";
import { NotFoundError } from "@/lib/errors/AppError";

export class CategoryService {
  static async getTree() {
    return prisma.category.findMany({
      where: {
        parentId: null,
        status: CategoryStatus.ACTIVE,
      },
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          where: { status: CategoryStatus.ACTIVE },
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });
  }

  static async getAll() {
    return prisma.category.findMany({
      where: { status: CategoryStatus.ACTIVE },
      orderBy: { sortOrder: "asc" },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });
  }

  static async getBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          where: { status: CategoryStatus.ACTIVE },
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { products: true } } },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundError(`Category "${slug}" not found`);
    }

    return category;
  }
}
