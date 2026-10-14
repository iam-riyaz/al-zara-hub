import { PrismaClient, ProductStatus, VariantStatus } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const CATEGORY_DATA: Record<
  string,
  {
    brands: string[];
    adjectives: string[];
    nouns: string[];
    descriptions: string[];
    images: string[];
    priceRange: [number, number];
  }
> = {
  "audio-headphones": {
    brands: ["Acoustix", "SoundCraft", "AudioZen", "Bose", "Sennheiser", "Harmonix"],
    adjectives: ["Aura Pro", "Studio Master", "True Wireless", "Ultra Spatial", "Noise Cancelling", "Hi-Fi Dynamic", "Pure Acoustic", "Vanguard", "Sonic Stream", "Resonance"],
    nouns: ["Over-Ear Headphones", "Wireless Earbuds", "Studio Monitors", "Portable Speaker", "Soundbar Pro", "DAC Audio Interface", "In-Ear Monitors", "Open-Back Headphones"],
    descriptions: [
      "Custom-tuned neodymium drivers delivering exceptional dynamic range, ultra-low distortion, and crystal clarity across the frequency spectrum.",
      "Hybrid active noise cancellation with transparency mode, ultra-plush memory foam ear cushions, and 40+ hour battery life.",
      "High-resolution spatial audio certified with low-latency Bluetooth 5.4 multipoint pairing and studio-grade voice pickup microphones.",
    ],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80",
    ],
    priceRange: [49, 399],
  },
  "laptops-computers": {
    brands: ["Apex Computes", "ZenBook", "UltraNova", "SwiftBook", "CoreCraft", "OmniTech"],
    adjectives: ["Titan Pro 16", "Stealth Air 14", "Creator Studio", "Carbon Slim 13", "Infinity Edge", "Matrix Precision", "Quantum Workstation", "Horizon Ultra"],
    nouns: ["Laptop", "Ultrabook", "Workstation PC", "Mechanical Keyboard", "Curved Ultrawide Monitor", "Thunderbolt 4 Dock", "Ergonomic Trackball Mouse"],
    descriptions: [
      "Powered by latest-generation architecture with unified high-bandwidth memory, radiant OLED display, and all-day battery efficiency.",
      "Aerospace-grade aluminum unibody chassis with vapor-chamber cooling, precision glass trackpad, and silent mechanical key switches.",
      "Engineered for software engineers, digital creators, and data analysts requiring blistering compilation and render speeds.",
    ],
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=800&q=80",
    ],
    priceRange: [129, 2199],
  },
  "wearables-smartwatches": {
    brands: ["Chronos", "Apex Motion", "AuraSense", "VeloSport", "Garmin", "NordicTrack"],
    adjectives: ["Apex Ultra", "Vanguard Titanium", "Verve Minimalist", "Summit Explorer", "Pulse Active", "Strata Sapphire", "Horizon Hybrid"],
    nouns: ["Smartwatch", "Fitness Tracker", "GPS Adventure Watch", "Titanium Watch Band", "Milanese Loop", "Sport Strap"],
    descriptions: [
      "Sapphire crystal glass casing with aerospace grade titanium bezel, multi-band GNSS tracking, and comprehensive health monitoring.",
      "Continuous heart rate variability, blood oxygen tracking, sleep stage analysis, and up to 14 days of power on a single magnetic charge.",
      "Water resistant to 100 meters with offline topographic maps, altimeter, barometer, and emergency satellite communication capability.",
    ],
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80",
    ],
    priceRange: [89, 699],
  },
  "fashion-apparel": {
    brands: ["Atelier Zara", "Nordic Thread", "Terra Silk", "Loom & Fibre", "Aura Studio", "Minimalist Co"],
    adjectives: ["Merino Wool", "Heavyweight Cotton", "Structured Linen", "Tailored Cashmere", "Brushed Fleece", "Raw Denim", "Japanese Poplin"],
    nouns: ["Overshirt", "Crewneck Sweater", "Relaxed Chino", "Minimalist Hoodie", "Oxford Shirt", "Trench Coat", "Cardigan Jacket"],
    descriptions: [
      "Crafted from premium long-staple organic fibres with meticulous single-needle stitching and enduring timeless silhouette.",
      "Pre-shrunk garment-dyed fabric with a natural drape, tailored for understated modern sophistication and all-day comfort.",
      "Designed with sustainable natural textiles, horn button closures, and reinforced seam stress points for lasting durability.",
    ],
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    ],
    priceRange: [55, 340],
  },
  "mens-collection": {
    brands: ["Atelier Zara", "Nordic Thread", "Vanguard Tailors", "Loom & Fibre", "Apex Apparel"],
    adjectives: ["Custom Tailored", "Relaxed Fit", "Technical Commuter", "Double-Breasted", "Water-Repellent", "Chunky Knit", "Garment-Washed"],
    nouns: ["Wool Blazer", "Commuter Pants", "Merino Turtleneck", "Waxed Canvas Jacket", "Field Overshirt", "Zip Bomber", "Polo Sweater"],
    descriptions: [
      "Refined architectural tailoring cut from breathable Italian wool blend, complete with horn buttons and inner utility pockets.",
      "Technical stretch fabrics offering freedom of movement, weather resistance, and sharp modern silhouette.",
      "Essential foundation piece constructed with heritage craftsmanship and ultra-clean minimal detailing.",
    ],
    images: [
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80",
    ],
    priceRange: [65, 420],
  },
  "womens-collection": {
    brands: ["Atelier Zara", "Terra Silk", "Aura Studio", "Nordic Thread", "Maison Mode"],
    adjectives: ["Silk Crepe", "Cashmere Blend", "Pleated Flow", "Structured Minimal", "Cocoon Silhouette", "Ribbed Modal", "Sculpted"],
    nouns: ["Midi Dress", "Wide-Leg Trouser", "Draped Silk Blouse", "Wrap Coat", "Cropped Knit Cardigan", "Tailored Vest", "Trench Cape"],
    descriptions: [
      "Effortless elegance rendered in fluid silk crepe de chine with delicate mother-of-pearl buttons and clean bias drape.",
      "Sumptuously soft Mongolian cashmere tailored into a relaxed silhouette with ribbed collar and drop shoulder construction.",
      "Structured minimalist styling meeting contemporary luxury, tailored to transition seamlessly from boardroom to evening dining.",
    ],
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80",
    ],
    priceRange: [75, 480],
  },
  "footwear-sneakers": {
    brands: ["Atelier Zara", "VeloSport", "Strata", "CloudStep", "Kobe Craft"],
    adjectives: ["Nappa Court", "All-Terrain Trail", "Minimalist Leather", "Retro Runner", "Vibram Lug", "Hydro-Shield", "Zero-Drop"],
    nouns: ["Low-Top Sneaker", "Trail Hiking Boot", "Calfskin Derby Shoe", "Chelsea Boot", "Slip-On Loafer", "Runner Trainer"],
    descriptions: [
      "Crafted with full-grain Italian Nappa leather, butter-soft calfskin lining, and durable Margom vulcanized rubber soles.",
      "Vibram Megagrip lugged outsoles with waterproof breathable membrane, delivering supreme traction on wet rock and mud.",
      "Featherweight dual-density midsole providing plush responsive rebound and cloud-like cushioning throughout the day.",
    ],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    ],
    priceRange: [110, 280],
  },
  "smart-home-lighting": {
    brands: ["Lumos Living", "AuraSense", "NestIQ", "AmbientIQ", "Nanoleaf"],
    adjectives: ["Ambient Circadian", "Smart HEPA", "Matter-Enabled", "Full Spectrum", "Wireless Mesh", "Precision Sensor", "Gradient"],
    nouns: ["Floor Lamp", "Air Purifier Pro", "Smart Thermostat Hub", "LED Lightstrip", "Motion Dimmer Switch", "Video Doorbell", "Home Security Camera"],
    descriptions: [
      "Transforms your interior ambiance with seamless circadian sync, 16 million colors, and responsive Apple Home / Alexa voice automation.",
      "True HEPA H13 filtration capturing 99.97% of airborne particles, featuring whisper-quiet 22dB sleep operation and PM2.5 real-time display.",
      "Zero-latency Thread and Matter connectivity ensuring instant remote management and smart home scene triggers.",
    ],
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80",
    ],
    priceRange: [49, 399],
  },
  "kitchen-dining": {
    brands: ["Crema & Co", "Le Artisan", "Katsura Cutlery", "BrewMaster", "Staub Craft"],
    adjectives: ["Precision Conical", "Enameled Cast Iron", "67-Layer Damascus", "Variable Temp Gooseneck", "Dual Boiler Commercial", "Cold Drip"],
    nouns: ["Burr Coffee Grinder", "Dutch Oven 6Qt", "8-Inch Chef Knife", "Pour-Over Kettle", "Espresso Machine", "Ceramic Pour-Over Dripper"],
    descriptions: [
      "Engineered for the discerning home barista with 60 micro-stepped grind settings and low-RPM motor preserving delicate coffee bean aromatics.",
      "Handcrafted enameled cast iron delivering superior heat distribution and retention, oven-safe up to 500°F with self-basting lid design.",
      "Authentic Japanese VG-10 core hardened to 60+ HRC, hand-finished to a razor-sharp 12-degree cutting edge with ergonomic Pakkawood handle.",
    ],
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
    ],
    priceRange: [39, 799],
  },
  "fitness-outdoors": {
    brands: ["Roam Gear", "Apex Motion", "TerraTrek", "VeloSport", "HydroFlow"],
    adjectives: ["Carbon Fiber", "Deep Tissue", "Double-Wall Insulated", "Ergonomic Cast", "High-Density Foam", "Weatherproof Expedition"],
    nouns: ["Trekking Poles", "Vibrating Massage Gun", "Vacuum Water Bottle", "Kettlebell Set", "Yoga Recovery Mat", "Backpacking Pack 45L"],
    descriptions: [
      "Ultra-light 3-section carbon composite shafts with quick-lock flick levers, breathable natural cork grips, and tungsten carbide tips.",
      "Brushless high-torque motor delivering 3200 percussions per minute with quiet glide technology and 6 swappable therapeutic attachments.",
      "Pro-grade 18/8 stainless steel double-wall vacuum insulation keeping beverages ice-cold for 24 hours or steaming hot for 12 hours.",
    ],
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    ],
    priceRange: [29, 299],
  },
};

// Fallback for general categories
const FALLBACK_CATEGORY = CATEGORY_DATA["audio-headphones"];

export async function generateRealisticProducts(targetCount = 1800) {
  console.log(`🚀 Generating ${targetCount} realistic products...`);

  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    throw new Error("No categories found in database. Run main seed first.");
  }

  // Check how many products we already have
  const existingCount = await prisma.product.count();
  console.log(`Current products in database: ${existingCount}`);

  const productsToCreate: any[] = [];
  const imagesToCreate: any[] = [];
  const variantsToCreate: any[] = [];
  const inventoriesToCreate: any[] = [];

  const existingSkus = new Set(
    (await prisma.product.findMany({ select: { sku: true } })).map((p) => p.sku)
  );
  const existingSlugs = new Set(
    (await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug)
  );

  let createdSoFar = 0;
  let attempt = 1;

  while (createdSoFar < targetCount) {
    const category = categories[createdSoFar % categories.length];
    const catData = CATEGORY_DATA[category.slug] || FALLBACK_CATEGORY;

    const brand = catData.brands[attempt % catData.brands.length];
    const adj = catData.adjectives[(attempt * 3) % catData.adjectives.length];
    const noun = catData.nouns[(attempt * 7) % catData.nouns.length];
    const edition = attempt % 5 === 0 ? "Special Edition" : attempt % 7 === 0 ? "Gen 2" : "";

    const name = `${brand} ${adj} ${noun}${edition ? ` - ${edition}` : ""}`;
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = existingSlugs.has(baseSlug)
      ? `${baseSlug}-${attempt}`
      : baseSlug;

    const skuPrefix = category.slug.substring(0, 3).toUpperCase();
    const sku = `${skuPrefix}-${String(10000 + attempt).padStart(5, "0")}`;

    if (existingSkus.has(sku) || existingSlugs.has(slug)) {
      attempt++;
      continue;
    }

    existingSkus.add(sku);
    existingSlugs.add(slug);

    const productId = `prod_gen_${randomUUID().replace(/-/g, "").substring(0, 20)}`;
    const variantId = `var_gen_${randomUUID().replace(/-/g, "").substring(0, 20)}`;
    const inventoryId = `inv_gen_${randomUUID().replace(/-/g, "").substring(0, 20)}`;

    const [minP, maxP] = catData.priceRange;
    const rawPrice = minP + Math.random() * (maxP - minP);
    const basePrice = Math.round(rawPrice * 100) / 100;
    const hasDiscount = attempt % 3 === 0;
    const compareAtPrice = hasDiscount
      ? Math.round(basePrice * (1.15 + Math.random() * 0.25) * 100) / 100
      : null;
    const costPrice = Math.round(basePrice * 0.45 * 100) / 100;

    const ratingAvg = Math.round((3.8 + Math.random() * 1.2) * 10) / 10;
    const ratingCount = Math.floor(8 + Math.random() * 180);

    const desc = catData.descriptions[attempt % catData.descriptions.length];
    const shortDesc = `${adj} ${noun} engineered by ${brand}. High-performance luxury craftsmanship.`;

    const img1 = catData.images[attempt % catData.images.length];
    const img2 = catData.images[(attempt + 1) % catData.images.length];

    // Inventory quantity: ~6% out of stock, ~10% low stock, remainder healthy stock
    let stock = Math.floor(15 + Math.random() * 85);
    if (attempt % 16 === 0) stock = 0; // Out of stock
    else if (attempt % 10 === 0) stock = Math.floor(1 + Math.random() * 4); // Low stock

    // 1. Product
    productsToCreate.push({
      id: productId,
      name,
      slug,
      sku,
      brand,
      categoryId: category.id,
      basePrice,
      compareAtPrice,
      costPrice,
      taxRate: 0.08,
      shortDescription: shortDesc,
      description: desc,
      status: ProductStatus.ACTIVE,
      ratingAverage: ratingAvg,
      ratingCount,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000),
      updatedAt: new Date(),
    });

    // 2. Primary & secondary image
    imagesToCreate.push({
      id: `img_gen_${randomUUID().replace(/-/g, "").substring(0, 20)}`,
      productId,
      url: img1,
      altText: `${name} primary view`,
      sortOrder: 0,
      isPrimary: true,
      createdAt: new Date(),
    });

    if (img2 && img2 !== img1) {
      imagesToCreate.push({
        id: `img_gen_${randomUUID().replace(/-/g, "").substring(0, 20)}`,
        productId,
        url: img2,
        altText: `${name} alternate angle`,
        sortOrder: 1,
        isPrimary: false,
        createdAt: new Date(),
      });
    }

    // 3. Variant
    const variantSku = `${sku}-STD`;
    variantsToCreate.push({
      id: variantId,
      productId,
      sku: variantSku,
      title: "Standard Edition",
      price: basePrice,
      compareAtPrice,
      status: stock > 0 ? VariantStatus.ACTIVE : VariantStatus.OUT_OF_STOCK,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. Inventory
    inventoriesToCreate.push({
      id: inventoryId,
      variantId,
      availableQuantity: stock,
      reservedQuantity: 0,
      soldQuantity: Math.floor(Math.random() * 40),
      lowStockThreshold: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    createdSoFar++;
    attempt++;
  }

  console.log(`Inserting ${productsToCreate.length} products in batches...`);

  // Bulk insert in chunks of 500 for optimal Postgres performance
  const chunkSize = 400;
  for (let i = 0; i < productsToCreate.length; i += chunkSize) {
    const prodChunk = productsToCreate.slice(i, i + chunkSize);
    const imgChunk = imagesToCreate.filter((img) =>
      prodChunk.some((p) => p.id === img.productId)
    );
    const varChunk = variantsToCreate.filter((v) =>
      prodChunk.some((p) => p.id === v.productId)
    );
    const invChunk = inventoriesToCreate.filter((inv) =>
      varChunk.some((v) => v.id === inv.variantId)
    );

    await prisma.$transaction([
      prisma.product.createMany({ data: prodChunk }),
      prisma.productImage.createMany({ data: imgChunk }),
      prisma.productVariant.createMany({ data: varChunk }),
      prisma.inventory.createMany({ data: invChunk }),
    ]);

    console.log(
      `✓ Inserted batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(
        productsToCreate.length / chunkSize
      )} (${prodChunk.length} products)`
    );
  }

  const newTotal = await prisma.product.count();
  console.log(`🎉 Total products in catalog now: ${newTotal}`);
}

if (require.main === module || process.argv[1].endsWith("seed-products.ts")) {
  generateRealisticProducts(1800)
    .then(() => {
      console.log("Seeding realistic products complete!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error generating products:", err);
      process.exit(1);
    });
}
