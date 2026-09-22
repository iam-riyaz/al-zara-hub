import { PaymentStatus } from "@prisma/client";

export interface PaymentIntentOptions {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  idempotencyKey?: string;
}

export interface PaymentIntentResult {
  clientSecret: string;
  transactionId: string;
  status: PaymentStatus;
}

export interface PaymentConfirmOptions {
  transactionId: string;
  simulateFailure?: boolean;
}

export interface PaymentConfirmResult {
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  paidAt: Date;
  rawResponse?: string;
}

export interface IPaymentProvider {
  createPaymentIntent(options: PaymentIntentOptions): Promise<PaymentIntentResult>;
  confirmPayment(options: PaymentConfirmOptions): Promise<PaymentConfirmResult>;
  refundPayment(transactionId: string, amount: number): Promise<{ success: boolean; status: PaymentStatus }>;
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;
}
