import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { MockPaymentProvider } from "@/lib/payments/MockPaymentProvider";
import { OrderService } from "@/features/orders/order.service";
import { PaymentProviderType, PaymentEventStatus } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-mock-signature") || request.headers.get("stripe-signature") || "";

    // Signature verification abstraction
    if (!MockPaymentProvider.verifyWebhookSignature(rawBody, signature)) {
      return Response.json({ success: false, error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const eventType = payload.type || "payment.succeeded";

    // Idempotency: prevent processing duplicate webhook event
    const existingEvent = await prisma.paymentEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent && existingEvent.status === PaymentEventStatus.PROCESSED) {
      return successResponse({ received: true, duplicate: true });
    }

    const eventRecord = existingEvent || (await prisma.paymentEvent.create({
      data: {
        eventId,
        provider: PaymentProviderType.MOCK,
        eventType,
        payload: rawBody,
        status: PaymentEventStatus.PENDING,
      },
    }));

    // Process event
    if (eventType === "payment.succeeded" && payload.orderId && payload.transactionId) {
      await OrderService.confirmOrderPayment(payload.orderId, payload.transactionId);
    }

    // Mark event processed
    await prisma.paymentEvent.update({
      where: { id: eventRecord.id },
      data: {
        status: PaymentEventStatus.PROCESSED,
        processedAt: new Date(),
      },
    });

    return successResponse({ received: true });
  } catch (error) {
    return errorResponse(error);
  }
}
