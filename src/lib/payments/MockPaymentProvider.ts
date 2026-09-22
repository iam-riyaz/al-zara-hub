import { IPaymentProvider, PaymentIntentOptions, PaymentIntentResult, PaymentConfirmOptions, PaymentConfirmResult } from "./PaymentProvider.interface";
import { PaymentStatus } from "@prisma/client";
import { PaymentError } from "../errors/AppError";

export class MockPaymentProvider implements IPaymentProvider {
  async createPaymentIntent(options: PaymentIntentOptions): Promise<PaymentIntentResult> {
    const transactionId = `txn_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const clientSecret = `sec_mock_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;

    return {
      clientSecret,
      transactionId,
      status: PaymentStatus.PENDING,
    };
  }

  async confirmPayment(options: PaymentConfirmOptions): Promise<PaymentConfirmResult> {
    if (options.simulateFailure) {
      throw new PaymentError("Simulated mock payment decline: Insufficient card balance");
    }

    return {
      transactionId: options.transactionId,
      status: PaymentStatus.PAID,
      amount: 0,
      paidAt: new Date(),
      rawResponse: JSON.stringify({
        mockGateway: true,
        network: "Visa",
        last4: "4242",
        authCode: "AUTH_MOCK_SUCCESS",
      }),
    };
  }

  async refundPayment(transactionId: string, amount: number) {
    return {
      success: true,
      status: PaymentStatus.REFUNDED,
    };
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    return PaymentStatus.PAID;
  }

  /**
   * Verify signature for simulated webhooks
   */
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    // In mock mode, check if signature header is present or matches mock secret
    return Boolean(signature && signature.length > 5);
  }
}

export const paymentProvider = new MockPaymentProvider();
