import { describe, it, expect } from "vitest";

describe("Cart & Pricing Calculation Logic", () => {
  it("should calculate correct subtotal, tax, and shipping", () => {
    const items = [
      { unitPrice: 299.99, quantity: 1, taxRate: 0.08 },
      { unitPrice: 79.99, quantity: 2, taxRate: 0.08 },
    ];

    const subtotal = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    const tax = items.reduce((acc, it) => acc + it.unitPrice * it.quantity * it.taxRate, 0);
    const shipping = subtotal > 150 ? 0 : 15;
    const total = subtotal + tax + shipping;

    expect(subtotal).toBeCloseTo(459.97, 2);
    expect(tax).toBeCloseTo(36.7976, 2);
    expect(shipping).toBe(0); // Free shipping because subtotal > 150
    expect(total).toBeCloseTo(496.77, 2);
  });

  it("should apply standard shipping for orders below $150", () => {
    const items = [
      { unitPrice: 55.00, quantity: 1, taxRate: 0.08 },
    ];

    const subtotal = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    const shipping = subtotal > 150 ? 0 : 15;

    expect(subtotal).toBe(55.00);
    expect(shipping).toBe(15);
  });
});
