import { PrismaClient, Role, UserStatus, AddressType, CategoryStatus, ProductStatus, VariantStatus, DiscountType, OrderStatus, PaymentStatus, PaymentProviderType, ReviewStatus, InventoryTransactionType } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Clean existing records in reverse dependency order
  console.log("Cleaning database tables...");
  await prisma.auditLog.deleteMany();
  await prisma.paymentEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderAddress.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariantOptionValue.deleteMany();
  await prisma.productOptionValue.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  console.log("Seeding users...");
  const adminPassword = await hashPassword("Admin@123456");
  const userPassword = await hashPassword("User@123456");

  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@alzara.com",
      passwordHash: adminPassword,
      firstName: "Super",
      lastName: "Admin",
      phone: "+1-555-0100",
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      email: "admin1@alzara.com",
      passwordHash: adminPassword,
      firstName: "Sarah",
      lastName: "Conner",
      phone: "+1-555-0101",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: "admin2@alzara.com",
      passwordHash: adminPassword,
      firstName: "David",
      lastName: "Miller",
      phone: "+1-555-0102",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    },
  });

  const customersData = [
    { email: "alex.chen@example.com", firstName: "Alex", lastName: "Chen", phone: "+1-555-0201", city: "San Francisco", state: "CA", zip: "94107", address: "450 Townsend St" },
    { email: "elena.rostova@example.com", firstName: "Elena", lastName: "Rostova", phone: "+1-555-0202", city: "New York", state: "NY", zip: "10001", address: "750 7th Ave" },
    { email: "marcus.vance@example.com", firstName: "Marcus", lastName: "Vance", phone: "+1-555-0203", city: "Austin", state: "TX", zip: "78701", address: "100 Congress Ave" },
    { email: "olivia.taylor@example.com", firstName: "Olivia", lastName: "Taylor", phone: "+1-555-0204", city: "Seattle", state: "WA", zip: "98101", address: "1200 4th Ave" },
    { email: "liam.smith@example.com", firstName: "Liam", lastName: "Smith", phone: "+1-555-0205", city: "Chicago", state: "IL", zip: "60601", address: "200 E Randolph St" },
  ];

  const seededUsers = [];
  for (const c of customersData) {
    const user = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash: userPassword,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        role: Role.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        addresses: {
          create: [
            {
              type: AddressType.SHIPPING,
              firstName: c.firstName,
              lastName: c.lastName,
              phone: c.phone,
              addressLine1: c.address,
              city: c.city,
              state: c.state,
              postalCode: c.zip,
              country: "US",
              isDefault: true,
            },
            {
              type: AddressType.BILLING,
              firstName: c.firstName,
              lastName: c.lastName,
              phone: c.phone,
              addressLine1: c.address,
              city: c.city,
              state: c.state,
              postalCode: c.zip,
              country: "US",
              isDefault: true,
            },
          ],
        },
        cart: { create: {} },
        wishlist: { create: {} },
      },
      include: { addresses: true, cart: true, wishlist: true },
    });
    seededUsers.push(user);
  }

  // 3. Seed Hierarchical Categories
  console.log("Seeding categories...");
  const catElectronics = await prisma.category.create({
    data: { name: "Electronics", slug: "electronics", description: "Cutting-edge consumer tech and smart gear", sortOrder: 1 },
  });
  const catAudio = await prisma.category.create({
    data: { name: "Audio & Headphones", slug: "audio-headphones", parentId: catElectronics.id, description: "Audiophile headphones, wireless earbuds, and speakers", sortOrder: 1 },
  });
  const catLaptops = await prisma.category.create({
    data: { name: "Laptops & Computers", slug: "laptops-computers", parentId: catElectronics.id, description: "Ultrabooks, workstations, and high-performance monitors", sortOrder: 2 },
  });
  const catWearables = await prisma.category.create({
    data: { name: "Wearables & Smartwatches", slug: "wearables-smartwatches", parentId: catElectronics.id, description: "Fitness trackers, cellular smartwatches, and accessories", sortOrder: 3 },
  });

  const catFashion = await prisma.category.create({
    data: { name: "Fashion & Apparel", slug: "fashion-apparel", description: "Contemporary apparel, outerwear, and footwear", sortOrder: 2 },
  });
  const catMens = await prisma.category.create({
    data: { name: "Men's Collection", slug: "mens-collection", parentId: catFashion.id, description: "Tailored suits, casual tees, denim, and jackets", sortOrder: 1 },
  });
  const catWomens = await prisma.category.create({
    data: { name: "Women's Collection", slug: "womens-collection", parentId: catFashion.id, description: "Dresses, knitwear, activewear, and outerwear", sortOrder: 2 },
  });
  const catFootwear = await prisma.category.create({
    data: { name: "Footwear & Sneakers", slug: "footwear-sneakers", parentId: catFashion.id, description: "Running sneakers, leather boots, and everyday loafers", sortOrder: 3 },
  });

  const catHome = await prisma.category.create({
    data: { name: "Home & Living", slug: "home-living", description: "Minimalist furniture, smart home devices, and kitchenware", sortOrder: 3 },
  });
  const catSmartHome = await prisma.category.create({
    data: { name: "Smart Home & Lighting", slug: "smart-home-lighting", parentId: catHome.id, description: "Ambient smart lighting, hubs, and climate controllers", sortOrder: 1 },
  });
  const catKitchen = await prisma.category.create({
    data: { name: "Kitchen & Dining", slug: "kitchen-dining", parentId: catHome.id, description: "Artisan espresso machines, cast iron, and ceramics", sortOrder: 2 },
  });

  const catFitness = await prisma.category.create({
    data: { name: "Fitness & Outdoors", slug: "fitness-outdoors", description: "Performance gym gear, travel packs, and outdoor equipment", sortOrder: 4 },
  });

  // 4. Seed 42 Realistic Products
  console.log("Seeding products and variants...");
  
  const rawProducts = [
    // Audio (5 products)
    {
      name: "Aura Pro Wireless ANC Headphones",
      slug: "aura-pro-wireless-anc-headphones",
      sku: "AUD-AUR-PRO",
      brand: "Acoustix",
      categoryId: catAudio.id,
      basePrice: 299.99,
      compareAtPrice: 349.99,
      costPrice: 140.00,
      shortDescription: "Flagship active noise-cancelling over-ear headphones with 45-hour battery life and studio-grade sound.",
      description: "Engineered for pure sonic immersion, the Aura Pro delivers high-resolution audio with custom 40mm titanium drivers. Experience industry-leading hybrid active noise cancellation, ultra-plush memory foam earcups, and crystal-clear multipoint Bluetooth 5.3 connectivity.",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Matte Black", "Silver Mist", "Midnight Navy"] }],
      variants: [
        { title: "Matte Black", sku: "AUD-AUR-PRO-BLK", price: 299.99, stock: 45 },
        { title: "Silver Mist", sku: "AUD-AUR-PRO-SLV", price: 299.99, stock: 25 },
        { title: "Midnight Navy", sku: "AUD-AUR-PRO-NAV", price: 319.99, stock: 4 }, // low stock
      ],
    },
    {
      name: "Pulse Mini Waterproof Bluetooth Speaker",
      slug: "pulse-mini-waterproof-bluetooth-speaker",
      sku: "AUD-PLS-MIN",
      brand: "Acoustix",
      categoryId: catAudio.id,
      basePrice: 79.99,
      compareAtPrice: 99.99,
      costPrice: 32.00,
      shortDescription: "Ultra-portable 360-degree waterproof speaker designed for adventures.",
      description: "IPX7 waterproof rating ensures you can enjoy thunderous bass and crisp highs anywhere — by the pool, at the beach, or on the trail. Delivers 16 hours of continuous playtime on a single USB-C charge.",
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Forest Green", "Charcoal", "Coral"] }],
      variants: [
        { title: "Forest Green", sku: "AUD-PLS-MIN-GRN", price: 79.99, stock: 60 },
        { title: "Charcoal", sku: "AUD-PLS-MIN-CHR", price: 79.99, stock: 35 },
        { title: "Coral", sku: "AUD-PLS-MIN-CRL", price: 79.99, stock: 0 }, // Out of stock test
      ],
    },
    {
      name: "Zenith True Wireless Earbuds",
      slug: "zenith-true-wireless-earbuds",
      sku: "AUD-ZNT-EAR",
      brand: "Acoustix",
      categoryId: catAudio.id,
      basePrice: 149.99,
      compareAtPrice: 179.99,
      costPrice: 65.00,
      shortDescription: "Low-latency wireless earbuds with spatial audio and wireless charging case.",
      description: "Equipped with quad microphones for noise-free voice calls, ergonomic in-ear tips, and Qi wireless charging. Perfect for commutes and intense workouts with IPX5 sweat resistance.",
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Gloss White", "Obsidian"] }],
      variants: [
        { title: "Gloss White", sku: "AUD-ZNT-WHT", price: 149.99, stock: 30 },
        { title: "Obsidian", sku: "AUD-ZNT-OBS", price: 149.99, stock: 18 },
      ],
    },
    {
      name: "Vanguard Studio Monitor Headphones",
      slug: "vanguard-studio-monitor-headphones",
      sku: "AUD-VNG-MON",
      brand: "SoundCraft",
      categoryId: catAudio.id,
      basePrice: 199.99,
      compareAtPrice: null,
      costPrice: 90.00,
      shortDescription: "Flat-response open-back reference headphones for music producers and mixers.",
      description: "Designed for mixing and mastering precision. Features open acoustic architecture, 50mm neodymium drivers, and detachable 3-meter oxygen-free copper cables.",
      images: [
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Impedance", values: ["80 Ohm", "250 Ohm"] }],
      variants: [
        { title: "80 Ohm", sku: "AUD-VNG-80", price: 199.99, stock: 22 },
        { title: "250 Ohm", sku: "AUD-VNG-250", price: 219.99, stock: 12 },
      ],
    },
    {
      name: "RetroWood Hi-Fi Bookshelf Speakers (Pair)",
      slug: "retrowood-hi-fi-bookshelf-speakers",
      sku: "AUD-RTW-BKS",
      brand: "SoundCraft",
      categoryId: catAudio.id,
      basePrice: 349.99,
      compareAtPrice: 399.99,
      costPrice: 160.00,
      shortDescription: "Hand-crafted walnut active bookshelf speakers with optical and phono inputs.",
      description: "Combines mid-century Scandinavian aesthetic with modern DSP processing. Built-in phono pre-amp for turntables, optical input for TV, and Bluetooth 5.0 aptX HD.",
      images: [
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Finish", values: ["Natural Walnut", "Piano Black"] }],
      variants: [
        { title: "Natural Walnut", sku: "AUD-RTW-WAL", price: 349.99, stock: 15 },
        { title: "Piano Black", sku: "AUD-RTW-BLK", price: 369.99, stock: 8 },
      ],
    },

    // Laptops & Computers (4 products)
    {
      name: "ApexBook Pro 16 Ultrabook",
      slug: "apexbook-pro-16-ultrabook",
      sku: "CMP-APX-16",
      brand: "Apex Computes",
      categoryId: catLaptops.id,
      basePrice: 1899.99,
      compareAtPrice: 2099.99,
      costPrice: 1250.00,
      shortDescription: "16-inch 4K OLED workstation with 12-core processor and 32GB unified memory.",
      description: "Crafted from aerospace-grade aluminum, the ApexBook Pro delivers desktop-class performance in a 1.6kg chassis. Features 120Hz ProMotion display, 99Wh battery, and vapor chamber thermal architecture.",
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Storage & RAM", values: ["1TB / 32GB RAM", "2TB / 64GB RAM"] }],
      variants: [
        { title: "1TB / 32GB RAM", sku: "CMP-APX-16-32", price: 1899.99, stock: 14 },
        { title: "2TB / 64GB RAM", sku: "CMP-APX-16-64", price: 2399.99, stock: 6 },
      ],
    },
    {
      name: "Horizon 34-Inch Curved Ultrawide Monitor",
      slug: "horizon-34-inch-curved-ultrawide-monitor",
      sku: "CMP-HRZ-34",
      brand: "Apex Computes",
      categoryId: catLaptops.id,
      basePrice: 699.99,
      compareAtPrice: 799.99,
      costPrice: 420.00,
      shortDescription: "WQHD 165Hz IPS curved ultrawide with 90W USB-C power delivery and KVM switch.",
      description: "Elevate your productivity and gaming with 3440x1440 resolution, 98% DCI-P3 color accuracy, and built-in KVM switch to control two computers with one keyboard and mouse.",
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Stand", values: ["Ergonomic Desk Stand", "Heavy-Duty Arm Mount"] }],
      variants: [
        { title: "Ergonomic Desk Stand", sku: "CMP-HRZ-34-STD", price: 699.99, stock: 19 },
        { title: "Heavy-Duty Arm Mount", sku: "CMP-HRZ-34-ARM", price: 749.99, stock: 8 },
      ],
    },
    {
      name: "Chronos Mechanical Wireless Keyboard",
      slug: "chronos-mechanical-wireless-keyboard",
      sku: "CMP-CHR-KB",
      brand: "KeyWorks",
      categoryId: catLaptops.id,
      basePrice: 129.99,
      compareAtPrice: 149.99,
      costPrice: 55.00,
      shortDescription: "75% compact hot-swappable mechanical keyboard with gasket mount and PBT keycaps.",
      description: "Features factory-lubed linear switches, sound dampening silicone foam, RGB backlighting with 18 animations, and triple connectivity (2.4GHz, Bluetooth, USB-C).",
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Switch Type", values: ["Linear Red", "Tactile Brown"] }],
      variants: [
        { title: "Linear Red", sku: "CMP-CHR-KB-RED", price: 129.99, stock: 40 },
        { title: "Tactile Brown", sku: "CMP-CHR-KB-BRN", price: 129.99, stock: 32 },
      ],
    },
    {
      name: "ErgoGlide Precision Wireless Mouse",
      slug: "ergoglide-precision-wireless-mouse",
      sku: "CMP-ERG-MS",
      brand: "KeyWorks",
      categoryId: catLaptops.id,
      basePrice: 89.99,
      compareAtPrice: 109.99,
      costPrice: 38.00,
      shortDescription: "Ergonomic vertical wireless mouse designed to reduce wrist strain.",
      description: "Sculpted 57-degree vertical angle promotes a natural handshake wrist posture. Equipped with 4000 DPI Darkfield laser sensor tracking on glass and hyper-fast scroll wheel.",
      images: [
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Graphite", "Pale Grey"] }],
      variants: [
        { title: "Graphite", sku: "CMP-ERG-MS-GRP", price: 89.99, stock: 28 },
        { title: "Pale Grey", sku: "CMP-ERG-MS-GRY", price: 89.99, stock: 15 },
      ],
    },

    // Wearables (4 products)
    {
      name: "Titan X Rugged GPS Smartwatch",
      slug: "titan-x-rugged-gps-smartwatch",
      sku: "WRB-TTN-X",
      brand: "Chronos",
      categoryId: catWearables.id,
      basePrice: 399.99,
      compareAtPrice: 449.99,
      costPrice: 210.00,
      shortDescription: "Titanium bezel smartwatch with dual-band GPS, sapphire glass, and 21-day battery life.",
      description: "Tested to US Military Standard 810 for thermal, shock, and water resistance up to 100 meters. Includes offline topographic maps, pulse oximeter, and VO2 max training advisor.",
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Band", values: ["Black Silicone", "Orange Trail Loop"] }],
      variants: [
        { title: "Black Silicone", sku: "WRB-TTN-X-BLK", price: 399.99, stock: 25 },
        { title: "Orange Trail Loop", sku: "WRB-TTN-X-ORG", price: 429.99, stock: 10 },
      ],
    },
    {
      name: "Halo Health & Sleep Tracker Band",
      slug: "halo-health-sleep-tracker-band",
      sku: "WRB-HLO-BD",
      brand: "Chronos",
      categoryId: catWearables.id,
      basePrice: 119.99,
      compareAtPrice: 139.99,
      costPrice: 50.00,
      shortDescription: "Screenless lightweight biometric sensor for continuous sleep, recovery, and strain monitoring.",
      description: "Designed for zero distractions. Worn on the wrist or forearm, the Halo band tracks heart rate variability (HRV), skin temperature, and sleep stages with clinical accuracy.",
      images: [
        "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Size", values: ["Small/Medium", "Large/XL"] }],
      variants: [
        { title: "Small/Medium", sku: "WRB-HLO-SM", price: 119.99, stock: 35 },
        { title: "Large/XL", sku: "WRB-HLO-LXL", price: 119.99, stock: 30 },
      ],
    },
    {
      name: "Lumina Minimalist Hybrid Watch",
      slug: "lumina-minimalist-hybrid-watch",
      sku: "WRB-LMN-HYB",
      brand: "NordicTime",
      categoryId: catWearables.id,
      basePrice: 189.99,
      compareAtPrice: 220.00,
      costPrice: 85.00,
      shortDescription: "Analog aesthetic with discreet hidden e-ink display for notifications and activity tracking.",
      description: "Crafted with Italian leather strap and 316L stainless steel case. Mechanical watch hands reveal an invisible digital screen when notifications arrive. 30-day battery life.",
      images: [
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Case Color", values: ["Rose Gold", "Brushed Silver"] }],
      variants: [
        { title: "Rose Gold", sku: "WRB-LMN-RSG", price: 199.99, stock: 16 },
        { title: "Brushed Silver", sku: "WRB-LMN-SLV", price: 189.99, stock: 24 },
      ],
    },
    {
      name: "Aura Smart Ring Generation 3",
      slug: "aura-smart-ring-gen-3",
      sku: "WRB-AUR-RNG",
      brand: "Chronos",
      categoryId: catWearables.id,
      basePrice: 299.99,
      compareAtPrice: 329.99,
      costPrice: 130.00,
      shortDescription: "Titanium biometric smart ring with daytime heart rate, readiness scores, and period tracking.",
      description: "Weighing less than 5 grams, this waterproof titanium ring monitors temperature changes, blood oxygen (SpO2), and sleep quality without the bulk of a wristband.",
      images: [
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Finish", values: ["Stealth Matte", "Gloss Gold"] }],
      variants: [
        { title: "Stealth Matte", sku: "WRB-AUR-RNG-STL", price: 299.99, stock: 14 },
        { title: "Gloss Gold", sku: "WRB-AUR-RNG-GLD", price: 349.99, stock: 7 },
      ],
    },

    // Men's Collection (5 products)
    {
      name: "Merino Wool Everyday Crew Sweater",
      slug: "merino-wool-everyday-crew-sweater",
      sku: "FSH-MEN-MRN",
      brand: "Atelier Zara",
      categoryId: catMens.id,
      basePrice: 110.00,
      compareAtPrice: 130.00,
      costPrice: 45.00,
      shortDescription: "100% extra-fine Australian merino wool sweater with naturally odor-resistant and thermo-regulating fibers.",
      description: "Super-soft 19.5-micron merino wool knit into a modern relaxed crewneck. Retains its shape wash after wash and provides effortless luxury from desk to dinner.",
      images: [
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
      ],
      options: [
        { name: "Size", values: ["S", "M", "L", "XL"] },
      ],
      variants: [
        { title: "Small / Charcoal", sku: "FSH-MEN-MRN-S", price: 110.00, stock: 18 },
        { title: "Medium / Charcoal", sku: "FSH-MEN-MRN-M", price: 110.00, stock: 30 },
        { title: "Large / Charcoal", sku: "FSH-MEN-MRN-L", price: 110.00, stock: 22 },
        { title: "XL / Charcoal", sku: "FSH-MEN-MRN-XL", price: 110.00, stock: 5 },
      ],
    },
    {
      name: "Water-Repellent Commuter Trench Coat",
      slug: "water-repellent-commuter-trench-coat",
      sku: "FSH-MEN-TRN",
      brand: "Atelier Zara",
      categoryId: catMens.id,
      basePrice: 245.00,
      compareAtPrice: 290.00,
      costPrice: 105.00,
      shortDescription: "Tailored minimalist trench coat with technical stormproof membrane and taped seams.",
      description: "A contemporary silhouette featuring clean hidden placket buttons, deep storm-flap pockets, internal passport pocket, and breathable 10k/10k waterproof twill fabric.",
      images: [
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Tan Camel", "Black"] }],
      variants: [
        { title: "Tan Camel", sku: "FSH-MEN-TRN-CML", price: 245.00, stock: 15 },
        { title: "Black", sku: "FSH-MEN-TRN-BLK", price: 245.00, stock: 12 },
      ],
    },
    {
      name: "Selvedge Denim Slim Tapered Jeans",
      slug: "selvedge-denim-slim-tapered-jeans",
      sku: "FSH-MEN-DNM",
      brand: "Atelier Zara",
      categoryId: catMens.id,
      basePrice: 135.00,
      compareAtPrice: 160.00,
      costPrice: 55.00,
      shortDescription: "13.5oz Japanese shuttle-loom woven raw selvedge denim.",
      description: "Custom copper hardware, red-line selvedge ID, and genuine leather patch. Starts crisp and molds to your body with personalized fades over time.",
      images: [
        "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Waist", values: ["30", "32", "34"] }],
      variants: [
        { title: "Waist 30", sku: "FSH-MEN-DNM-30", price: 135.00, stock: 16 },
        { title: "Waist 32", sku: "FSH-MEN-DNM-32", price: 135.00, stock: 25 },
        { title: "Waist 34", sku: "FSH-MEN-DNM-34", price: 135.00, stock: 20 },
      ],
    },
    {
      name: "Heavyweight Organic Cotton T-Shirt 3-Pack",
      slug: "heavyweight-organic-cotton-tshirt-3pack",
      sku: "FSH-MEN-TEE",
      brand: "BasicModern",
      categoryId: catMens.id,
      basePrice: 65.00,
      compareAtPrice: 75.00,
      costPrice: 22.00,
      shortDescription: "240 GSM organic combed cotton t-shirts in classic neutral tones.",
      description: "Substantial handfeel with reinforced ribbed collar that never sags. Pre-shrunk and dyed with eco-friendly non-toxic certified pigments.",
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Pack Theme", values: ["Monochrome (White/Grey/Black)", "Earth (Olive/Clay/Sand)"] }],
      variants: [
        { title: "Monochrome", sku: "FSH-MEN-TEE-MNC", price: 65.00, stock: 45 },
        { title: "Earth", sku: "FSH-MEN-TEE-ETH", price: 65.00, stock: 35 },
      ],
    },
    {
      name: "Italian Leather Minimalist Bifold Wallet",
      slug: "italian-leather-minimalist-bifold-wallet",
      sku: "FSH-MEN-WLT",
      brand: "Atelier Zara",
      categoryId: catMens.id,
      basePrice: 55.00,
      compareAtPrice: 70.00,
      costPrice: 20.00,
      shortDescription: "Full-grain Tuscan vegetable-tanned leather bifold with RFID blocking.",
      description: "Holds up to 10 cards and flat cash in an ultra-slim 8mm profile. Beautiful edge finishing with hand-waxed German polyester stitching.",
      images: [
        "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Cognac Brown", "Jet Black"] }],
      variants: [
        { title: "Cognac Brown", sku: "FSH-MEN-WLT-CGN", price: 55.00, stock: 50 },
        { title: "Jet Black", sku: "FSH-MEN-WLT-BLK", price: 55.00, stock: 40 },
      ],
    },

    // Women's Collection (5 products)
    {
      name: "Cashmere Oversized Turtleneck Knit",
      slug: "cashmere-oversized-turtleneck-knit",
      sku: "FSH-WMN-CSH",
      brand: "Atelier Zara",
      categoryId: catWomens.id,
      basePrice: 195.00,
      compareAtPrice: 240.00,
      costPrice: 85.00,
      shortDescription: "Grade-A Mongolian 2-ply cashmere knit with relaxed raglan sleeves.",
      description: "Cloud-soft luxury that breathes effortlessly. Features ribbed high neck, stepped hem with side slits, and a cozy silhouette tailored for timeless elegance.",
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Oatmeal Heather", "Midnight Navy"] }],
      variants: [
        { title: "Oatmeal Heather", sku: "FSH-WMN-CSH-OAT", price: 195.00, stock: 20 },
        { title: "Midnight Navy", sku: "FSH-WMN-CSH-NAV", price: 195.00, stock: 15 },
      ],
    },
    {
      name: "Pure Mulberry Silk Midi Slip Dress",
      slug: "pure-mulberry-silk-midi-slip-dress",
      sku: "FSH-WMN-SLK",
      brand: "Atelier Zara",
      categoryId: catWomens.id,
      basePrice: 175.00,
      compareAtPrice: 210.00,
      costPrice: 75.00,
      shortDescription: "19-momme pure mulberry silk dress with bias cut and adjustable straps.",
      description: "Drapes gracefully across natural curves with a flattering cowl neckline. Wear it solo with heels or layer over a fitted tee for daytime chic.",
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Emerald Green", "Champagne Gold"] }],
      variants: [
        { title: "Emerald Green", sku: "FSH-WMN-SLK-EMR", price: 175.00, stock: 18 },
        { title: "Champagne Gold", sku: "FSH-WMN-SLK-GLD", price: 175.00, stock: 14 },
      ],
    },
    {
      name: "Structured Italian Wool Wrap Coat",
      slug: "structured-italian-wool-wrap-coat",
      sku: "FSH-WMN-WRP",
      brand: "Atelier Zara",
      categoryId: catWomens.id,
      basePrice: 320.00,
      compareAtPrice: 380.00,
      costPrice: 140.00,
      shortDescription: "Double-faced virgin wool wrap coat with detachable tie belt.",
      description: "Exquisite craftsmanship from Italian mills. Oversized notch lapels, unlined for fluid movement, and deep welt pockets keep you warm in refined style.",
      images: [
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Camel", "Charcoal Melange"] }],
      variants: [
        { title: "Camel", sku: "FSH-WMN-WRP-CML", price: 320.00, stock: 12 },
        { title: "Charcoal Melange", sku: "FSH-WMN-WRP-CHR", price: 320.00, stock: 8 },
      ],
    },
    {
      name: "High-Waisted Tailored Pleated Trousers",
      slug: "high-waisted-tailored-pleated-trousers",
      sku: "FSH-WMN-TRS",
      brand: "Atelier Zara",
      categoryId: catWomens.id,
      basePrice: 120.00,
      compareAtPrice: 140.00,
      costPrice: 48.00,
      shortDescription: "Wide-leg flowing trousers with front pleats and side slant pockets.",
      description: "Crisp tailoring meets fluid crepe fabric. The high-rise waist accentuates lines while the wide-leg cut creates breezy sophistication.",
      images: [
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Size", values: ["US 4", "US 6", "US 8"] }],
      variants: [
        { title: "US 4", sku: "FSH-WMN-TRS-4", price: 120.00, stock: 22 },
        { title: "US 6", sku: "FSH-WMN-TRS-6", price: 120.00, stock: 25 },
        { title: "US 8", sku: "FSH-WMN-TRS-8", price: 120.00, stock: 16 },
      ],
    },
    {
      name: "Sculpt Seamless Ribbed Active Jumpsuit",
      slug: "sculpt-seamless-ribbed-active-jumpsuit",
      sku: "FSH-WMN-ACT",
      brand: "AeroForm",
      categoryId: catWomens.id,
      basePrice: 88.00,
      compareAtPrice: 105.00,
      costPrice: 35.00,
      shortDescription: "Compression ribbed one-piece with open back and moisture-wicking stretch.",
      description: "Designed for yoga, pilates, and studio training. 4-way stretch knit contours your body while remaining 100% squat-proof and sweat-resistant.",
      images: [
        "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Slate Blue", "Espresso"] }],
      variants: [
        { title: "Slate Blue", sku: "FSH-WMN-ACT-BLU", price: 88.00, stock: 30 },
        { title: "Espresso", sku: "FSH-WMN-ACT-ESP", price: 88.00, stock: 24 },
      ],
    },

    // Footwear (4 products)
    {
      name: "CloudVelo Carbon Road Running Shoes",
      slug: "cloudvelo-carbon-road-running-shoes",
      sku: "FTW-CLD-RUN",
      brand: "VeloSport",
      categoryId: catFootwear.id,
      basePrice: 185.00,
      compareAtPrice: 215.00,
      costPrice: 78.00,
      shortDescription: "Propulsive carbon-fiber plate marathon racing shoe with nitrogen-infused foam.",
      description: "Weighing just 205 grams, the CloudVelo features an engineered mesh upper, curved carbon rocker, and Continental rubber outsole for maximum energy return.",
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Size", values: ["US 9", "US 10", "US 11"] }],
      variants: [
        { title: "US 9", sku: "FTW-CLD-9", price: 185.00, stock: 25 },
        { title: "US 10", sku: "FTW-CLD-10", price: 185.00, stock: 30 },
        { title: "US 11", sku: "FTW-CLD-11", price: 185.00, stock: 15 },
      ],
    },
    {
      name: "Handcrafted Chelsea Boots in Waxed Suede",
      slug: "handcrafted-chelsea-boots-waxed-suede",
      sku: "FTW-CHS-BOT",
      brand: "Atelier Zara",
      categoryId: catFootwear.id,
      basePrice: 220.00,
      compareAtPrice: 260.00,
      costPrice: 95.00,
      shortDescription: "Goodyear-welted weatherproof suede chelsea boots with Dainite rubber soles.",
      description: "Water-resistant waxed calfskin suede, elastic side gussets, pull tabs, and cork-filled midsoles that conform to the shape of your foot.",
      images: [
        "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Snuff Suede", "Dark Brown"] }],
      variants: [
        { title: "Snuff Suede", sku: "FTW-CHS-SNF", price: 220.00, stock: 18 },
        { title: "Dark Brown", sku: "FTW-CHS-BRN", price: 220.00, stock: 12 },
      ],
    },
    {
      name: "Minimalist Leather Court Sneaker",
      slug: "minimalist-leather-court-sneaker",
      sku: "FTW-CRT-SNK",
      brand: "Atelier Zara",
      categoryId: catFootwear.id,
      basePrice: 140.00,
      compareAtPrice: 165.00,
      costPrice: 58.00,
      shortDescription: "Full-grain Nappa leather low-top court sneaker with Margom rubber cupsole.",
      description: "Zero branding, clean tonal stitching, and calfskin interior lining. The ultimate versatile everyday shoe that pairs with suits or denim.",
      images: [
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Pure White", "Off-White / Gum"] }],
      variants: [
        { title: "Pure White", sku: "FTW-CRT-WHT", price: 140.00, stock: 40 },
        { title: "Off-White / Gum", sku: "FTW-CRT-GUM", price: 140.00, stock: 28 },
      ],
    },
    {
      name: "Alpine All-Terrain Waterproof Trail Hiker",
      slug: "alpine-all-terrain-waterproof-trail-hiker",
      sku: "FTW-ALP-TRL",
      brand: "VeloSport",
      categoryId: catFootwear.id,
      basePrice: 195.00,
      compareAtPrice: 230.00,
      costPrice: 85.00,
      shortDescription: "GORE-TEX membrane hiking boot with Vibram Megagrip traction lugs.",
      description: "Engineered for alpine trails, muddy switchbacks, and rocky descents. Molded EVA midsole provides plush underfoot cushioning on 20+ mile treks.",
      images: [
        "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Size", values: ["US 9.5", "US 10.5"] }],
      variants: [
        { title: "US 9.5", sku: "FTW-ALP-95", price: 195.00, stock: 20 },
        { title: "US 10.5", sku: "FTW-ALP-105", price: 195.00, stock: 14 },
      ],
    },

    // Smart Home & Lighting (4 products)
    {
      name: "Lumos Ambient Smart Floor Lamp",
      slug: "lumos-ambient-smart-floor-lamp",
      sku: "HOM-LMS-LMP",
      brand: "Lumos Living",
      categoryId: catSmartHome.id,
      basePrice: 179.99,
      compareAtPrice: 219.99,
      costPrice: 75.00,
      shortDescription: "Ultra-thin corner LED floor lamp with 16 million colors and circadian sync.",
      description: "Transforms room ambiance with smooth color gradients, music rhythm synchronization, and voice control via HomeKit, Alexa, and Google Home.",
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Finish", values: ["Matte Black", "Brushed Brass"] }],
      variants: [
        { title: "Matte Black", sku: "HOM-LMS-LMP-BLK", price: 179.99, stock: 30 },
        { title: "Brushed Brass", sku: "HOM-LMS-LMP-BRS", price: 199.99, stock: 12 },
      ],
    },
    {
      name: "AeroPure Smart HEPA Air Purifier",
      slug: "aeropure-smart-hepa-air-purifier",
      sku: "HOM-ARP-AIR",
      brand: "Lumos Living",
      categoryId: catSmartHome.id,
      basePrice: 199.99,
      compareAtPrice: 249.99,
      costPrice: 90.00,
      shortDescription: "3-stage true HEPA H13 filtration covering up to 800 sq ft with real-time PM2.5 display.",
      description: "Removes 99.97% of airborne dust, pet dander, pollen, and smoke particles. Ultra-quiet sleep mode runs at whisper-level 24dB.",
      images: [
        "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Model", values: ["Standard Filter", "Pet Allergy Carbon Filter"] }],
      variants: [
        { title: "Standard Filter", sku: "HOM-ARP-STD", price: 199.99, stock: 25 },
        { title: "Pet Allergy Carbon Filter", sku: "HOM-ARP-PET", price: 229.99, stock: 18 },
      ],
    },
    {
      name: "Sentry Smart Video Doorbell Pro",
      slug: "sentry-smart-video-doorbell-pro",
      sku: "HOM-SNT-DBL",
      brand: "SentryTech",
      categoryId: catSmartHome.id,
      basePrice: 149.99,
      compareAtPrice: 179.99,
      costPrice: 62.00,
      shortDescription: "2K HDR video doorbell with local microSD storage and package detection.",
      description: "Dual cameras monitor head-to-toe visitors and doorstep parcels. Zero monthly subscription fees required with local AES-256 encrypted storage.",
      images: [
        "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Mount", values: ["Hardwired", "Rechargeable Battery"] }],
      variants: [
        { title: "Hardwired", sku: "HOM-SNT-WRD", price: 149.99, stock: 35 },
        { title: "Rechargeable Battery", sku: "HOM-SNT-BAT", price: 169.99, stock: 20 },
      ],
    },
    {
      name: "Zenith Smart Mesh WiFi 6E Router System (3-Pack)",
      slug: "zenith-smart-mesh-wifi-6e-router-system",
      sku: "HOM-ZNT-MSH",
      brand: "Apex Computes",
      categoryId: catSmartHome.id,
      basePrice: 349.99,
      compareAtPrice: 399.99,
      costPrice: 180.00,
      shortDescription: "Tri-band mesh router system delivering up to 5,400 Mbps across 6,000 square feet.",
      description: "Supports up to 200 connected devices with zero buffering or dropped connections. Includes parental controls and automated threat defense.",
      images: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Pack Size", values: ["2-Pack (4000 sq ft)", "3-Pack (6000 sq ft)"] }],
      variants: [
        { title: "2-Pack", sku: "HOM-ZNT-MSH-2", price: 269.99, stock: 15 },
        { title: "3-Pack", sku: "HOM-ZNT-MSH-3", price: 349.99, stock: 22 },
      ],
    },

    // Kitchen & Dining (5 products)
    {
      name: "Barista Pro Dual Boiler Espresso Machine",
      slug: "barista-pro-dual-boiler-espresso-machine",
      sku: "KTN-BRS-ESP",
      brand: "Crema & Co",
      categoryId: catKitchen.id,
      basePrice: 799.99,
      compareAtPrice: 899.99,
      costPrice: 420.00,
      shortDescription: "Commercial PID temperature controlled espresso machine with 58mm stainless portafilter.",
      description: "Dual stainless steel boilers allow simultaneous espresso extraction and instant powerful microfoam steaming. Digital shot timer and pre-infusion pressure gauge.",
      images: [
        "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Finish", values: ["Brushed Stainless", "Matte Truffle"] }],
      variants: [
        { title: "Brushed Stainless", sku: "KTN-BRS-STN", price: 799.99, stock: 12 },
        { title: "Matte Truffle", sku: "KTN-BRS-TRF", price: 849.99, stock: 7 },
      ],
    },
    {
      name: "Conical Burr Precision Coffee Grinder",
      slug: "conical-burr-precision-coffee-grinder",
      sku: "KTN-CNC-GRN",
      brand: "Crema & Co",
      categoryId: catKitchen.id,
      basePrice: 179.99,
      compareAtPrice: 209.99,
      costPrice: 80.00,
      shortDescription: "40mm hardened steel conical burrs with 60 stepped precision grind settings.",
      description: "Low-RPM DC motor prevents bean overheating, preserving delicate aromatic oils. Features digital dosage timer to 0.1-second increments.",
      images: [
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Matte Black", "Silver"] }],
      variants: [
        { title: "Matte Black", sku: "KTN-CNC-BLK", price: 179.99, stock: 25 },
        { title: "Silver", sku: "KTN-CNC-SLV", price: 179.99, stock: 18 },
      ],
    },
    {
      name: "Enameled Cast Iron Dutch Oven (6 Quart)",
      slug: "enameled-cast-iron-dutch-oven-6-quart",
      sku: "KTN-DTCH-OVN",
      brand: "Le Artisan",
      categoryId: catKitchen.id,
      basePrice: 145.00,
      compareAtPrice: 175.00,
      costPrice: 65.00,
      shortDescription: "Heavy-duty chip-resistant enameled cast iron for braising, baking sourdough, and stews.",
      description: "Superior heat retention and distribution with self-basting spikes on the lid interior. Oven safe up to 500°F and compatible with all cooktops including induction.",
      images: [
        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Cerulean Blue", "Burnt Dijon", "Matte White"] }],
      variants: [
        { title: "Cerulean Blue", sku: "KTN-DTCH-BLU", price: 145.00, stock: 18 },
        { title: "Burnt Dijon", sku: "KTN-DTCH-DJN", price: 145.00, stock: 14 },
        { title: "Matte White", sku: "KTN-DTCH-WHT", price: 145.00, stock: 9 },
      ],
    },
    {
      name: "Japanese Damascus Steel 8-Inch Chef Knife",
      slug: "japanese-damascus-steel-8-inch-chef-knife",
      sku: "KTN-CHF-KNF",
      brand: "Katsura Cutlery",
      categoryId: catKitchen.id,
      basePrice: 125.00,
      compareAtPrice: 155.00,
      costPrice: 50.00,
      shortDescription: "67 layers of authentic Damascus steel with VG-10 super core and G10 ergonomic handle.",
      description: "Hand-honed to a razor-sharp 12-degree cutting edge. Perfectly balanced for effortless slicing, dicing, and mincing with Rockwell hardness 60±2.",
      images: [
        "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Handle", values: ["Ebony Pakkawood", "Black G10"] }],
      variants: [
        { title: "Ebony Pakkawood", sku: "KTN-CHF-PKW", price: 125.00, stock: 30 },
        { title: "Black G10", sku: "KTN-CHF-G10", price: 125.00, stock: 24 },
      ],
    },
    {
      name: "Gooseneck Smart Variable Temperature Kettle",
      slug: "gooseneck-smart-variable-temperature-kettle",
      sku: "KTN-GSN-KTL",
      brand: "Crema & Co",
      categoryId: catKitchen.id,
      basePrice: 119.99,
      compareAtPrice: 139.99,
      costPrice: 52.00,
      shortDescription: "Precision pour-over electric kettle with 1-degree temperature control and 60-min hold.",
      description: "Counterbalanced handle and fluted spout provide deliberate, steady water flow essential for specialty pour-over brew recipes.",
      images: [
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Matte Black with Walnut", "All White"] }],
      variants: [
        { title: "Matte Black with Walnut", sku: "KTN-GSN-BLK", price: 129.99, stock: 35 },
        { title: "All White", sku: "KTN-GSN-WHT", price: 119.99, stock: 20 },
      ],
    },

    // Fitness & Outdoors (5 products)
    {
      name: "Nomad All-Weather Expandable 35L Travel Backpack",
      slug: "nomad-all-weather-expandable-35l-travel-backpack",
      sku: "FIT-NMD-BPK",
      brand: "Roam Gear",
      categoryId: catFitness.id,
      basePrice: 189.00,
      compareAtPrice: 220.00,
      costPrice: 80.00,
      shortDescription: "TSA carry-on compliant backpack made from recycled 840D ballistic nylon.",
      description: "Clamshell opening for effortless packing, dedicated padded 16-inch laptop compartment, hidden passport security pocket, and magnetic sternum strap.",
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Stealth Black", "Olive Drab"] }],
      variants: [
        { title: "Stealth Black", sku: "FIT-NMD-BPK-BLK", price: 189.00, stock: 32 },
        { title: "Olive Drab", sku: "FIT-NMD-BPK-OLV", price: 189.00, stock: 18 },
      ],
    },
    {
      name: "ProGrip Adjustable Dumbbell Set (Pair, 5-52.5 lbs)",
      slug: "progrip-adjustable-dumbbell-set",
      sku: "FIT-DMB-SET",
      brand: "IronStrength",
      categoryId: catFitness.id,
      basePrice: 349.99,
      compareAtPrice: 399.99,
      costPrice: 190.00,
      shortDescription: "Space-saving selector dial dumbbells replacing 15 sets of weights in one footprint.",
      description: "Rapid weight adjustments from 5 to 52.5 lbs with a smooth turn of the dial. Durable molding around metal plates creates smooth liftoff and quiet workouts.",
      images: [
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Option", values: ["Dumbbells Pair Only", "Dumbbells with Stand"] }],
      variants: [
        { title: "Dumbbells Pair Only", sku: "FIT-DMB-PAIR", price: 349.99, stock: 14 },
        { title: "Dumbbells with Stand", sku: "FIT-DMB-STND", price: 449.99, stock: 8 },
      ],
    },
    {
      name: "Align Natural Cork High-Grip Yoga Mat",
      slug: "align-natural-cork-high-grip-yoga-mat",
      sku: "FIT-YGA-MAT",
      brand: "Zenith Flow",
      categoryId: catFitness.id,
      basePrice: 78.00,
      compareAtPrice: 95.00,
      costPrice: 28.00,
      shortDescription: "Sustainable antimicrobial organic cork yoga mat with laser-etched alignment guides.",
      description: "Cork naturally gets grippier as sweat increases, providing unmatched traction during hot yoga and vinyasa flows. Backed with non-slip natural tree rubber.",
      images: [
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Thickness", values: ["4.5mm Standard", "6mm Extra Cushion"] }],
      variants: [
        { title: "4.5mm Standard", sku: "FIT-YGA-45", price: 78.00, stock: 40 },
        { title: "6mm Extra Cushion", sku: "FIT-YGA-60", price: 88.00, stock: 25 },
      ],
    },
    {
      name: "UltraLight 2-Person Backpacking Tent",
      slug: "ultralight-2-person-backpacking-tent",
      sku: "FIT-TNT-2P",
      brand: "Roam Gear",
      categoryId: catFitness.id,
      basePrice: 289.00,
      compareAtPrice: 340.00,
      costPrice: 135.00,
      shortDescription: "Freestanding 3-season tent weighing only 2.8 lbs with dual vestibules.",
      description: "Ripstop silicone-treated nylon fly with 3000mm waterproof PU coating. DAC featherlite aluminum poles setup in under 3 minutes.",
      images: [
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Forest Green", "Amber Gold"] }],
      variants: [
        { title: "Forest Green", sku: "FIT-TNT-GRN", price: 289.00, stock: 16 },
        { title: "Amber Gold", sku: "FIT-TNT-AMB", price: 289.00, stock: 11 },
      ],
    },
    {
      name: "HydroThermal Vacuum Insulated Water Bottle 32oz",
      slug: "hydrothermal-vacuum-insulated-water-bottle-32oz",
      sku: "FIT-BTL-32",
      brand: "Roam Gear",
      categoryId: catFitness.id,
      basePrice: 38.00,
      compareAtPrice: 45.00,
      costPrice: 14.00,
      shortDescription: "Double-wall stainless steel bottle keeping drinks icy cold for 24 hours.",
      description: "18/8 pro-grade stainless steel with sweat-free powder coat finish. Wide mouth accommodates ice cubes and includes leakproof straw lid.",
      images: [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
      ],
      options: [{ name: "Color", values: ["Matte Black", "Pacific Blue", "Desert Sage"] }],
      variants: [
        { title: "Matte Black", sku: "FIT-BTL-BLK", price: 38.00, stock: 65 },
        { title: "Pacific Blue", sku: "FIT-BTL-BLU", price: 38.00, stock: 50 },
        { title: "Desert Sage", sku: "FIT-BTL-SGE", price: 38.00, stock: 42 },
      ],
    },
  ];

  const seededProducts = [];

  for (const p of rawProducts) {
    const createdProduct = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        brand: p.brand,
        categoryId: p.categoryId,
        basePrice: p.basePrice,
        compareAtPrice: p.compareAtPrice,
        costPrice: p.costPrice,
        taxRate: 0.08,
        shortDescription: p.shortDescription,
        description: p.description,
        status: ProductStatus.ACTIVE,
        images: {
          create: p.images.map((imgUrl, idx) => ({
            url: imgUrl,
            altText: `${p.name} - view ${idx + 1}`,
            sortOrder: idx,
            isPrimary: idx === 0,
          })),
        },
      },
    });

    // Create Options and Option Values
    for (const opt of p.options) {
      const optionRecord = await prisma.productOption.create({
        data: {
          productId: createdProduct.id,
          name: opt.name,
          position: 0,
          values: {
            create: opt.values.map((val, valIdx) => ({
              value: val,
              position: valIdx,
            })),
          },
        },
        include: { values: true },
      });

      // Create Variants & Inventories
      for (const v of p.variants) {
        // match option value
        const matchedVal = optionRecord.values.find((ov) => v.title.includes(ov.value)) || optionRecord.values[0];

        const variantRecord = await prisma.productVariant.create({
          data: {
            productId: createdProduct.id,
            sku: v.sku,
            title: v.title,
            price: v.price,
            compareAtPrice: p.compareAtPrice,
            status: v.stock > 0 ? VariantStatus.ACTIVE : VariantStatus.OUT_OF_STOCK,
            optionValues: {
              create: {
                optionValueId: matchedVal.id,
              },
            },
            inventory: {
              create: {
                availableQuantity: v.stock,
                reservedQuantity: 0,
                soldQuantity: 10,
                lowStockThreshold: 5,
                transactions: {
                  create: {
                    type: InventoryTransactionType.RESTOCK,
                    quantity: v.stock + 10,
                    referenceType: "INITIAL_SEED",
                    notes: "Initial inventory restock upon platform launch",
                  },
                },
              },
            },
          },
        });
      }
    }

    seededProducts.push(createdProduct);
  }

  // 5. Seed Coupons
  console.log("Seeding coupons...");
  const couponWelcome = await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      description: "10% off your entire first order",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10.00,
      minOrderAmount: 50.00,
      maxDiscountAmount: 50.00,
      usageLimit: 500,
      perUserLimit: 1,
      isActive: true,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  const couponFlat50 = await prisma.coupon.create({
    data: {
      code: "FLAT50",
      description: "$50 off premium orders over $250",
      discountType: DiscountType.FIXED,
      discountValue: 50.00,
      minOrderAmount: 250.00,
      usageLimit: 100,
      perUserLimit: 2,
      isActive: true,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  });

  const couponExpired = await prisma.coupon.create({
    data: {
      code: "EXPIRED20",
      description: "Expired flash sale coupon",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20.00,
      minOrderAmount: 100.00,
      usageLimit: 50,
      perUserLimit: 1,
      isActive: false,
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  const couponLimited = await prisma.coupon.create({
    data: {
      code: "LIMITED5",
      description: "Strictly limited to 5 redemptions ($15 off)",
      discountType: DiscountType.FIXED,
      discountValue: 15.00,
      minOrderAmount: 50.00,
      usageLimit: 5,
      usageCount: 4, // 1 redemption left for race testing!
      perUserLimit: 1,
      isActive: true,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // 6. Seed Realistic Historical Orders
  console.log("Seeding realistic historical orders...");
  const orderUser1 = seededUsers[0];
  const orderUser2 = seededUsers[1];
  const orderUser3 = seededUsers[2];

  // Fetch some variants
  const allVariants = await prisma.productVariant.findMany({
    include: { product: true },
    take: 10,
  });

  // Order 1: Delivered order for Alex Chen
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-00101",
      userId: orderUser1.id,
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      currency: "USD",
      subtotal: 299.99,
      discountAmount: 29.99,
      taxAmount: 21.60,
      shippingAmount: 0.00,
      totalAmount: 291.60,
      couponId: couponWelcome.id,
      idempotencyKey: "seed-order-alex-001",
      notes: "Please leave by the front door",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: allVariants[0].productId,
            variantId: allVariants[0].id,
            productName: allVariants[0].product.name,
            variantSku: allVariants[0].sku,
            variantTitle: allVariants[0].title,
            unitPrice: 299.99,
            quantity: 1,
            taxRate: 0.08,
            taxAmount: 21.60,
            discountAmount: 29.99,
            totalAmount: 291.60,
          },
        ],
      },
      addresses: {
        create: [
          {
            type: AddressType.SHIPPING,
            firstName: "Alex",
            lastName: "Chen",
            phone: "+1-555-0201",
            addressLine1: "450 Townsend St",
            city: "San Francisco",
            state: "CA",
            postalCode: "94107",
            country: "US",
          },
        ],
      },
      statusHistory: {
        create: [
          { fromStatus: null, toStatus: OrderStatus.PENDING, notes: "Order placed by customer", createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
          { fromStatus: OrderStatus.PENDING, toStatus: OrderStatus.CONFIRMED, notes: "Mock payment authorized and paid", createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 60000) },
          { fromStatus: OrderStatus.CONFIRMED, toStatus: OrderStatus.PROCESSING, notes: "Order picked and packed in fulfillment warehouse", createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          { fromStatus: OrderStatus.PROCESSING, toStatus: OrderStatus.SHIPPED, notes: "Handed over to carrier FedEx (Tracking: FX-99214482)", createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000) },
          { fromStatus: OrderStatus.SHIPPED, toStatus: OrderStatus.DELIVERED, notes: "Delivered to porch", createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000) },
        ],
      },
      payments: {
        create: {
          provider: PaymentProviderType.MOCK,
          transactionId: "TXN-MOCK-10001",
          amount: 291.60,
          currency: "USD",
          status: PaymentStatus.PAID,
          paymentMethod: "Credit Card (simulated)",
        },
      },
      couponUsages: {
        create: {
          couponId: couponWelcome.id,
          userId: orderUser1.id,
          discountAmount: 29.99,
        },
      },
    },
  });

  // Order 2: Processing order for Elena Rostova
  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-00102",
      userId: orderUser2.id,
      status: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.PAID,
      currency: "USD",
      subtotal: 349.99,
      discountAmount: 50.00,
      taxAmount: 24.00,
      shippingAmount: 15.00,
      totalAmount: 338.99,
      couponId: couponFlat50.id,
      idempotencyKey: "seed-order-elena-002",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: allVariants[4].productId,
            variantId: allVariants[4].id,
            productName: allVariants[4].product.name,
            variantSku: allVariants[4].sku,
            variantTitle: allVariants[4].title,
            unitPrice: 349.99,
            quantity: 1,
            taxRate: 0.08,
            taxAmount: 24.00,
            discountAmount: 50.00,
            totalAmount: 338.99,
          },
        ],
      },
      addresses: {
        create: [
          {
            type: AddressType.SHIPPING,
            firstName: "Elena",
            lastName: "Rostova",
            phone: "+1-555-0202",
            addressLine1: "750 7th Ave",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "US",
          },
        ],
      },
      statusHistory: {
        create: [
          { fromStatus: null, toStatus: OrderStatus.PENDING, notes: "Order initiated", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { fromStatus: OrderStatus.PENDING, toStatus: OrderStatus.CONFIRMED, notes: "Payment successful", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30000) },
          { fromStatus: OrderStatus.CONFIRMED, toStatus: OrderStatus.PROCESSING, notes: "Sent to warehouse", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        ],
      },
      payments: {
        create: {
          provider: PaymentProviderType.MOCK,
          transactionId: "TXN-MOCK-10002",
          amount: 338.99,
          currency: "USD",
          status: PaymentStatus.PAID,
          paymentMethod: "Mock Gateway",
        },
      },
      couponUsages: {
        create: {
          couponId: couponFlat50.id,
          userId: orderUser2.id,
          discountAmount: 50.00,
        },
      },
    },
  });

  // 7. Seed Reviews & Compute Ratings
  console.log("Seeding reviews and rating aggregates...");
  const reviewsSeedData = [
    {
      productIndex: 0,
      userIndex: 0,
      orderId: order1.id,
      rating: 5,
      title: "Best ANC headphones I've ever owned",
      comment: "The noise cancellation easily rivals Sony and Bose. The soundstage is remarkably wide and the battery genuinely lasts over 40 hours.",
      isVerifiedPurchase: true,
    },
    {
      productIndex: 0,
      userIndex: 1,
      rating: 5,
      title: "Extremely comfortable for 8+ hour workdays",
      comment: "Memory foam pads are so soft they don't clamp your glasses. Premium materials throughout.",
      isVerifiedPurchase: false,
    },
    {
      productIndex: 0,
      userIndex: 2,
      rating: 4,
      title: "Superb sound, slightly heavy case",
      comment: "Audio fidelity is crisp with punchy low-end. The travel case is a bit bulky, but overall 9/10.",
      isVerifiedPurchase: false,
    },
    {
      productIndex: 1,
      userIndex: 3,
      rating: 5,
      title: "Surprisingly loud and clear bass",
      comment: "Took it kayaking and it took splashes with zero issues. Great battery life too.",
      isVerifiedPurchase: false,
    },
    {
      productIndex: 5,
      userIndex: 1,
      orderId: order2.id,
      rating: 5,
      title: "Incredible productivity display",
      comment: "The ultrawide curve is comfortable and replaces two 27-inch monitors cleanly. The USB-C PD powers my laptop with one cable.",
      isVerifiedPurchase: true,
    },
    {
      productIndex: 9,
      userIndex: 2,
      rating: 5,
      title: "Built like a tank",
      comment: "Did a 3-day backcountry trek in the Rockies. GPS lock was instant and battery dropped only 15%.",
      isVerifiedPurchase: false,
    },
    {
      productIndex: 13,
      userIndex: 0,
      rating: 5,
      title: "Luxurious feel without the luxury brand markup",
      comment: "Softest merino sweater in my closet. Washed twice on gentle cycle and holds its shape perfectly.",
      isVerifiedPurchase: false,
    },
    {
      productIndex: 22,
      userIndex: 4,
      rating: 5,
      title: "True cafe-grade espresso at home",
      comment: "Dual boiler means no waiting between pulling a shot and frothing milk. High quality 58mm portafilter included.",
      isVerifiedPurchase: false,
    },
  ];

  for (const r of reviewsSeedData) {
    const product = seededProducts[r.productIndex];
    const user = seededUsers[r.userIndex];

    await prisma.review.create({
      data: {
        productId: product.id,
        userId: user.id,
        orderId: r.orderId,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isVerifiedPurchase: r.isVerifiedPurchase,
        status: ReviewStatus.APPROVED,
      },
    });
  }

  // Update ratingAverage and ratingCount on products that received reviews
  for (const product of seededProducts) {
    const reviews = await prisma.review.findMany({
      where: { productId: product.id, status: ReviewStatus.APPROVED },
    });
    if (reviews.length > 0) {
      const avg = reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length;
      await prisma.product.update({
        where: { id: product.id },
        data: {
          ratingAverage: avg,
          ratingCount: reviews.length,
        },
      });
    }
  }

  // 8. Seed Audit Log entries
  console.log("Seeding audit logs...");
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: superAdmin.id,
        action: "PLATFORM_INITIALIZATION",
        entityType: "SYSTEM",
        entityId: "SYSTEM",
        newValue: JSON.stringify({ message: "Platform initialized and baseline catalog seeded" }),
        ipAddress: "127.0.0.1",
        userAgent: "Al-Zara CLI Seeder/1.0",
      },
      {
        actorId: admin1.id,
        action: "COUPON_CREATED",
        entityType: "COUPON",
        entityId: couponWelcome.id,
        newValue: JSON.stringify({ code: "WELCOME10", discountValue: 10 }),
        ipAddress: "127.0.0.1",
        userAgent: "Al-Zara Admin/1.0",
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log("--------------------------------------------------");
  console.log("🔑 DEMO CREDENTIALS:");
  console.log("Super Admin: superadmin@alzara.com | Admin@123456");
  console.log("Admin 1:     admin1@alzara.com     | Admin@123456");
  console.log("Admin 2:     admin2@alzara.com     | Admin@123456");
  console.log("Customer:    alex.chen@example.com | User@123456");
  console.log("Customer:    elena.rostova@example.com | User@123456");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
