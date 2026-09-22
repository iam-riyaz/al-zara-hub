import { prisma } from "@/lib/db/prisma";
import { OrderStatus, PaymentStatus, PaymentProviderType, AddressType } from "@prisma/client";
import { CartService } from "../cart/cart.service";
import { CouponService } from "../coupons/coupon.service";
import { InventoryService } from "../inventory/inventory.service";
import { OrderStateMachine } from "./order-state-machine";
import { paymentProvider } from "@/lib/payments/MockPaymentProvider";
import { emailProvider } from "@/lib/email/MockEmailProvider";
import { NotFoundError, ValidationError, ConflictError, AuthorizationError } from "@/lib/errors/AppError";

export interface CheckoutInput {
  userId: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  couponCode?: string;
  idempotencyKey?: string;
  notes?: string;
}

export class OrderService {
  /**
   * Two-phase Checkout:
   * Phase 1: DB Transaction reserving inventory, validating prices, and creating pending order.
   * Phase 2: Create payment intent outside the DB transaction.
   */
  static async checkout(input: CheckoutInput) {
    // 1. Idempotency Check
    if (input.idempotencyKey) {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { items: true, payments: true, addresses: true },
      });
      if (existing) {
        return {
          order: existing,
          alreadyProcessed: true,
        };
      }
    }

    // 2. Fetch active cart
    const cart = await CartService.getCart();
    if (!cart || cart.items.length === 0) {
      throw new ValidationError("Cannot checkout with an empty cart");
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 3. Validate coupon if provided
    let discountAmount = 0;
    let couponId: string | undefined;

    if (input.couponCode) {
      const couponResult = await CouponService.validate(input.couponCode, cart.subtotal, input.userId);
      discountAmount = couponResult.calculatedDiscount;
      couponId = couponResult.couponId;
    }

    const effectiveSubtotal = Math.max(0, cart.subtotal - discountAmount);
    const taxAmount = Math.round(effectiveSubtotal * 0.08 * 100) / 100;
    const shippingAmount = cart.subtotal > 150 ? 0 : 15.0;
    const totalAmount = Math.round((effectiveSubtotal + taxAmount + shippingAmount) * 100) / 100;

    // 4. Phase 1: Database Transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the pending order record
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: input.userId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          currency: "USD",
          subtotal: cart.subtotal,
          discountAmount,
          taxAmount,
          shippingAmount,
          totalAmount,
          couponId,
          idempotencyKey: input.idempotencyKey,
          notes: input.notes,
        },
      });

      // Reserve stock atomically inside transaction
      await InventoryService.reserveStock(
        cart.items.map((it) => ({ variantId: it.variantId, quantity: it.quantity })),
        newOrder.id,
        tx
      );

      // Create immutable snapshots of OrderItems
      for (const it of cart.items) {
        const itemTax = Math.round(it.totalPrice * 0.08 * 100) / 100;
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: it.product.id,
            variantId: it.variantId,
            productName: it.product.name,
            variantSku: it.product.sku,
            variantTitle: it.product.variantTitle,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
            taxRate: 0.08,
            taxAmount: itemTax,
            discountAmount: 0,
            totalAmount: it.totalPrice,
          },
        });
      }

      // Create OrderAddresses
      await tx.orderAddress.create({
        data: {
          orderId: newOrder.id,
          type: AddressType.SHIPPING,
          ...input.shippingAddress,
        },
      });

      if (input.billingAddress) {
        await tx.orderAddress.create({
          data: {
            orderId: newOrder.id,
            type: AddressType.BILLING,
            ...input.billingAddress,
          },
        });
      }

      // Record OrderStatusHistory
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: null,
          toStatus: OrderStatus.PENDING,
          notes: "Order placed. Inventory reserved pending payment.",
        },
      });

      // Record Coupon Usage
      if (couponId) {
        await tx.couponUsage.create({
          data: {
            couponId,
            userId: input.userId,
            orderId: newOrder.id,
            discountAmount,
          },
        });
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Clear user cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    // 5. Phase 2: Outside DB Transaction: Call Payment Provider
    const paymentIntent = await paymentProvider.createPaymentIntent({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount.toNumber(),
      currency: order.currency,
      idempotencyKey: input.idempotencyKey,
    });

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: PaymentProviderType.MOCK,
        transactionId: paymentIntent.transactionId,
        amount: order.totalAmount,
        currency: order.currency,
        status: PaymentStatus.PENDING,
        paymentMethod: "Mock Payment Gateway",
      },
    });

    return {
      order,
      paymentIntent,
      payment,
    };
  }

  /**
   * Confirm payment and transition order to CONFIRMED
   */
  static async confirmOrderPayment(orderId: string, transactionId: string, simulateFailure = false) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: { select: { email: true, firstName: true } },
      },
    });

    if (!order) throw new NotFoundError("Order not found");

    if (order.status !== OrderStatus.PENDING) {
      return { success: true, order, alreadyConfirmed: true };
    }

    if (simulateFailure) {
      // Payment Failed: release reserved stock and mark order cancelled
      await InventoryService.releaseStock(
        order.items.map((it) => ({ variantId: it.variantId!, quantity: it.quantity })),
        order.id
      );

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.FAILED,
          statusHistory: {
            create: {
              fromStatus: OrderStatus.PENDING,
              toStatus: OrderStatus.CANCELLED,
              notes: "Payment failed or declined by issuer. Reserved stock released.",
            },
          },
        },
      });

      throw new ValidationError("Payment was declined. Your order has been cancelled and stock released.");
    }

    // Payment Succeeded: Commit sale & confirm order
    const confirmResult = await paymentProvider.confirmPayment({ transactionId });

    await prisma.$transaction(async (tx) => {
      // Commit reserved stock to sold
      await InventoryService.commitSale(
        order.items.map((it) => ({ variantId: it.variantId!, quantity: it.quantity })),
        order.id,
        tx
      );

      // Update Order Status
      OrderStateMachine.validateTransition(order.status, OrderStatus.CONFIRMED);

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          statusHistory: {
            create: {
              fromStatus: OrderStatus.PENDING,
              toStatus: OrderStatus.CONFIRMED,
              notes: `Payment verified (${confirmResult.transactionId}). Order confirmed for fulfillment.`,
            },
          },
        },
      });

      // Update Payment
      await tx.payment.updateMany({
        where: { orderId: order.id },
        data: {
          status: PaymentStatus.PAID,
          rawResponse: confirmResult.rawResponse,
        },
      });
    });

    // Send async confirmation email
    await emailProvider.sendEmail({
      to: order.user.email,
      subject: `Order Confirmation: ${order.orderNumber} - Al-Zara Hub`,
      html: `
        <h1>Thank you for your order, ${order.user.firstName}!</h1>
        <p>Your order <strong>${order.orderNumber}</strong> has been confirmed and paid in full.</p>
        <p>Total: $${Number(order.totalAmount).toFixed(2)}</p>
      `,
    });

    return {
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
    };
  }

  /**
   * Cancel an order if allowed by OrderStateMachine
   */
  static async cancelOrder(orderId: string, reason: string, actorId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundError("Order not found");

    if (!OrderStateMachine.isCancellable(order.status)) {
      throw new ValidationError(`Order cannot be cancelled in state "${order.status}"`);
    }

    // Release stock
    await InventoryService.releaseStock(
      order.items.map((it) => ({ variantId: it.variantId!, quantity: it.quantity })),
      order.id
    );

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CANCELLED,
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: OrderStatus.CANCELLED,
            notes: `Cancelled: ${reason}`,
            actorId,
          },
        },
      },
    });

    return updated;
  }

  static async getOrderById(orderId: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { slug: true, images: { take: 1 } } },
          },
        },
        addresses: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
        payments: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    if (!order) throw new NotFoundError("Order not found");

    // IDOR Protection: non-admin user can only view their own order
    if (userId && order.userId !== userId) {
      throw new AuthorizationError("You do not have permission to view this order");
    }

    return order;
  }

  static async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: { take: 3 },
        payments: true,
      },
    });
  }
}
