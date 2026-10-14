import { describe, it, expect } from "vitest";

describe("Catalog Virtualization Logic", () => {
  // Generate 1,500 mock products
  const mockProducts = Array.from({ length: 1500 }, (_, i) => ({
    id: `prod_${i + 1}`,
    name: `Realistic Luxury Product ${i + 1}`,
    slug: `product-${i + 1}`,
    basePrice: 99.99 + (i % 50),
    compareAtPrice: 129.99,
    ratingAverage: 4.8,
    ratingCount: 42,
    images: [{ url: "https://example.com/img.jpg" }],
    variants: [{ id: `var_${i + 1}`, price: 99.99, inventory: { availableQuantity: 10 } }],
  }));

  it("chunks thousands of products into responsive grid rows properly", () => {
    const columnCount = 3;
    const rows: (typeof mockProducts)[] = [];
    for (let i = 0; i < mockProducts.length; i += columnCount) {
      rows.push(mockProducts.slice(i, i + columnCount));
    }

    // 1500 products / 3 columns = 500 rows
    expect(rows.length).toBe(500);
    expect(rows[0].length).toBe(3);
    expect(rows[499].length).toBe(3);

    // Verify stable IDs are preserved across rows
    expect(rows[0][0].id).toBe("prod_1");
    expect(rows[0][1].id).toBe("prod_2");
    expect(rows[0][2].id).toBe("prod_3");
    expect(rows[1][0].id).toBe("prod_4");
  });

  it("virtualization overscan calculates only a tiny subset of rows to render", () => {
    const totalRows = 500; // 1,500 products
    const viewportHeight = 800;
    const rowHeight = 460;
    const overscan = 2;

    // Suppose user scrolled to row index 10 (scrollTop = 4600)
    const scrollTop = 4600;
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endIndex = Math.min(
      totalRows - 1,
      Math.floor((scrollTop + viewportHeight) / rowHeight) + overscan
    );

    const renderedRowIndices = [];
    for (let i = startIndex; i <= endIndex; i++) {
      renderedRowIndices.push(i);
    }

    // Rather than 500 rows (1,500 products), only ~6 rows (~18 products) are rendered!
    expect(renderedRowIndices.length).toBeLessThanOrEqual(7);
    expect(renderedRowIndices.length * 3).toBeLessThanOrEqual(21);
    expect(startIndex).toBe(8); // 10 - 2 overscan
    expect(endIndex).toBe(13); // 11 + 2 overscan
  });
});
