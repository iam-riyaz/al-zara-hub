import { prisma } from "@/lib/db/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export class AdminAnalyticsService {
  static async getOverviewMetrics() {
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      pendingOrders,
      lowStockCount,
      revenueResult,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      prisma.inventory.count({
        where: { availableQuantity: { lte: 5 } },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: true,
        },
      }),
      prisma.orderItem.groupBy({
        by: ["productName"],
        _sum: { quantity: true, totalAmount: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    const totalRevenue = Number(revenueResult._sum.totalAmount || 0);
    const averageOrderValue = Number(revenueResult._avg.totalAmount || 0);

    return {
      totalRevenue,
      averageOrderValue,
      totalOrders,
      totalUsers,
      totalProducts,
      pendingOrders,
      lowStockCount,
      recentOrders,
      topProducts,
    };
  }
}
