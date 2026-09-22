import { describe, it, expect } from "vitest";
import { OrderStateMachine } from "@/features/orders/order-state-machine";
import { OrderStatus } from "@prisma/client";

describe("Order State Machine Lifecycle Validation", () => {
  it("should permit valid sequential progression: PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED", () => {
    expect(OrderStateMachine.canTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED)).toBe(true);
    expect(OrderStateMachine.canTransition(OrderStatus.CONFIRMED, OrderStatus.PROCESSING)).toBe(true);
    expect(OrderStateMachine.canTransition(OrderStatus.PROCESSING, OrderStatus.SHIPPED)).toBe(true);
    expect(OrderStateMachine.canTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).toBe(true);
  });

  it("should permit cancellation from PENDING, CONFIRMED, or PROCESSING", () => {
    expect(OrderStateMachine.canTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true);
    expect(OrderStateMachine.canTransition(OrderStatus.CONFIRMED, OrderStatus.CANCELLED)).toBe(true);
    expect(OrderStateMachine.canTransition(OrderStatus.PROCESSING, OrderStatus.CANCELLED)).toBe(true);
  });

  it("should reject illegal transitions: DELIVERED -> PENDING, CANCELLED -> CONFIRMED, SHIPPED -> CONFIRMED", () => {
    expect(OrderStateMachine.canTransition(OrderStatus.DELIVERED, OrderStatus.PENDING)).toBe(false);
    expect(OrderStateMachine.canTransition(OrderStatus.CANCELLED, OrderStatus.CONFIRMED)).toBe(false);
    expect(OrderStateMachine.canTransition(OrderStatus.SHIPPED, OrderStatus.CONFIRMED)).toBe(false);
  });

  it("should throw InvalidStateTransitionError when calling validateTransition on illegal transition", () => {
    expect(() => {
      OrderStateMachine.validateTransition(OrderStatus.DELIVERED, OrderStatus.PROCESSING);
    }).toThrowError(/Cannot transition order from "DELIVERED" to "PROCESSING"/);
  });
});
