import { OrderStatus } from "@prisma/client";
import { InvalidStateTransitionError } from "@/lib/errors/AppError";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

export class OrderStateMachine {
  static canTransition(current: OrderStatus, next: OrderStatus): boolean {
    const allowed = ALLOWED_TRANSITIONS[current] || [];
    return allowed.includes(next);
  }

  static validateTransition(current: OrderStatus, next: OrderStatus): void {
    if (!this.canTransition(current, next)) {
      throw new InvalidStateTransitionError(
        `Cannot transition order from "${current}" to "${next}". Allowed next states: [${(
          ALLOWED_TRANSITIONS[current] || []
        ).join(", ")}]`
      );
    }
  }

  static isCancellable(status: OrderStatus): boolean {
    const cancellableStates: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING];
    return cancellableStates.includes(status);
  }
}
