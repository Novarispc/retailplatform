import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    slug: "cricket-bats",
    name: "Cricket Bats",
    description: "English willow and Kashmir willow bats for all levels",
    imageUrl: "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-1.webp?v=1773746302",
  },
  {
    slug: "combos",
    name: "Combos & Full Kits",
    description: "Complete cricket kits and combo deals for all budgets",
    imageUrl: "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-06-02at5.37.07PM.jpg?v=1780402285",
  },
  {
    slug: "kit-bags",
    name: "Kit Bags",
    description: "Duffle and wheelie kit bags to carry all your gear",
    imageUrl: "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-06-10at6.25.16PM.jpg?v=1781096827",
  },
  {
    slug: "cricket-shoes",
    name: "Cricket Shoes",
    description: "Rubber and spike cricket shoes for turf and grass pitches",
    imageUrl: "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-06-04at3.40.07PM.jpg?v=1780567954",
  },
  {
    slug: "batting-protection",
    name: "Batting Protection",
    description: "Gloves, pads, and wicket-keeping gear",
    imageUrl: "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-06-11at5.53.56PM.jpg?v=1781180717",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Knocking hammers, cricket socks and training essentials",
    imageUrl: "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/ChatGPTImageFeb13_2026_11_51_51AM.png",
  },
];

type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  priceMinor: number;
  category: string;
  featured?: boolean;
  stock?: number;
  rating?: number;
  images: string[];
  specs: Record<string, string>;
};

const PRODUCTS: SeedProduct[] = [
  // ── Cricket Bats ─────────────────────────────────────────────
  {
    slug: "em-pro-player-ew",
    name: "EM Pro Player Cricket Bat (English Willow)",
    description: "EM Pro Player — English willow blade crafted for serious batsmen. Full profile, thick edge, and a pronounced bow deliver exceptional power through the shot.",
    priceMinor: 550000,
    category: "cricket-bats",
    featured: true,
    stock: 12,
    rating: 4.7,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-1_8e1f9c67-9b12-42be-96cf-1443fc43c01c.png?v=1774607797",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-2_8ff62d6a-f3aa-407c-ad17-6f3f54dbab10.png?v=1774607797",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-3_a33d0ca3-2d55-43f3-a894-c9f473b20282.webp?v=1774607797",
    ],
    specs: { Brand: "EM", Willow: "English Willow", Level: "Professional", Type: "Bat" },
  },
  {
    slug: "em-pro-player",
    name: "EM Pro Player Cricket Bat",
    description: "EM Pro Player — tried and tested by competitive cricketers. Balanced pick-up with a thick edge for maximum shot-making confidence.",
    priceMinor: 550000,
    category: "cricket-bats",
    featured: true,
    stock: 10,
    rating: 4.6,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-1.png?v=1774356127",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-2.png?v=1774356127",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-3_aedccbb5-6a60-4b86-a3ef-408dfa11cf88.jpg?v=1774356127",
    ],
    specs: { Brand: "EM", Willow: "English Willow", Level: "Professional", Type: "Bat" },
  },
  {
    slug: "em-xt-giant-ew",
    name: "EM XT Giant Cricket Bat (English Willow)",
    description: "EM XT Giant — an oversized blade with a massive sweet spot for attacking batsmen. Engineered for explosive hitting at all levels of the game.",
    priceMinor: 450000,
    category: "cricket-bats",
    featured: true,
    stock: 15,
    rating: 4.5,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-1_59f9ab0f-98e3-48ee-a792-a15faff8ecdc.webp?v=1774282439",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-2_5535d35a-7d84-4453-9eda-67df83af3fcb.jpg?v=1774282439",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-3_93c0e39a-9983-4c8b-8d69-9928b7b69e66.jpg?v=1774282439",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-5_f3eb52e7-8da7-4765-941d-8735105ff499.png?v=1774282439",
    ],
    specs: { Brand: "EM", Willow: "English Willow", Level: "Club", Type: "Bat" },
  },
  {
    slug: "em-bold-360",
    name: "EM Bold 360 Cricket Bat",
    description: "EM Bold 360 — an all-round performer built for the modern batsman. Mid-weight with a wide face and deep grains for consistent performance.",
    priceMinor: 350000,
    category: "cricket-bats",
    featured: true,
    stock: 20,
    rating: 4.4,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-1_d50de1f9-b09a-494a-af63-8c199e8226b7.jpeg?v=1773851962",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-2_6c3b1863-54ba-41ed-b82e-a3e92dad87c1.jpg?v=1773851962",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-3_68c47fd5-803c-4eae-a437-b0ea10f285ab.png?v=1773851962",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-4_669162c4-5850-478e-8636-c31daedb4b12.jpg?v=1773851962",
    ],
    specs: { Brand: "EM", Willow: "Kashmir Willow", Level: "Club", Type: "Bat" },
  },
  {
    slug: "rns-atomic",
    name: "RNS Atomic Cricket Bat",
    description: "RNS Atomic — power-packed Kashmir willow bat designed for hard hitters. Low-profile grip with a mid-to-low sweet spot for ground strokes and sixes.",
    priceMinor: 400000,
    category: "cricket-bats",
    featured: true,
    stock: 18,
    rating: 4.5,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-1.webp?v=1773746302",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-2.webp?v=1773746302",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-4.png?v=1773746302",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-5.png?v=1773746302",
    ],
    specs: { Brand: "RNS", Willow: "Kashmir Willow", Level: "Club", Type: "Bat" },
  },
  {
    slug: "rns-boss-black-gold",
    name: "RNS Boss Black Gold Edition Cricket Bat",
    description: "RNS Boss Black Gold Edition — premium finish with a bold aesthetic. Excellent balance and a power-loaded sweet spot for the stylish striker.",
    priceMinor: 319900,
    category: "cricket-bats",
    featured: true,
    stock: 14,
    rating: 4.4,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-06-11at5.15.35PM.jpg?v=1781178998",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-06-11_at_5.14.57_PM.jpg?v=1781179033",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-06-11_at_5.14.57_PM_c3ac31c4-d991-4e47-b84a-8729fe0615df.jpg?v=1781179098",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-06-11_at_5.14.56_PM.jpg?v=1781179172",
    ],
    specs: { Brand: "RNS", Willow: "Kashmir Willow", Level: "Club", Type: "Bat" },
  },
  {
    slug: "sf-cobra-2-0",
    name: "SF Cobra 2.0 Cricket Bat",
    description: "SF Cobra 2.0 — aggressive profile with a reinforced spine for greater rebound. Popular choice among club and inter-district level batsmen.",
    priceMinor: 470000,
    category: "cricket-bats",
    stock: 16,
    rating: 4.4,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-1.jpg?v=1773745997",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-2_389ee33a-4f56-4747-881f-44946efa18b6.jpg?v=1773745997",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-3_0e5a6257-22da-405d-aa88-ee13dcef423c.jpg?v=1773745997",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-4_b2e25a97-63ee-4fba-b56f-e8d93b8d21e9.jpg?v=1773745997",
    ],
    specs: { Brand: "SF", Willow: "Kashmir Willow", Level: "Club", Type: "Bat" },
  },
  {
    slug: "ss-nicholas-pooran",
    name: "SS Nicholas Pooran Cricket Bat",
    description: "SS Nicholas Pooran signature bat — inspired by the explosive West Indies captain. High-edge profile, short handle, and a powerful lower sweet spot for T20 domination.",
    priceMinor: 380000,
    category: "cricket-bats",
    stock: 20,
    rating: 4.3,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-4_eb831cf4-7eb2-44e6-82c0-0b6dc90cb392.jpg?v=1773903065",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-5_f7757f6f-d1ce-410a-b3aa-c20b975e947c.jpg?v=1773903065",
    ],
    specs: { Brand: "SS", Willow: "Kashmir Willow", Level: "Club", Type: "Bat" },
  },
  {
    slug: "ss-vintage-bolt",
    name: "SS Vintage Bolt Cricket Bat",
    description: "SS Vintage Bolt — classic design meeting modern performance. A reliable all-round bat with a traditional pick-up, perfect for technique-first batsmen.",
    priceMinor: 280000,
    category: "cricket-bats",
    stock: 25,
    rating: 4.2,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-1_aec18c4b-fb44-493d-ad5b-4fe161dc566e.jpg?v=1773691637",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-2_d812b14e-3bb4-4834-8c8c-9c0498c36071.jpg?v=1773691637",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-3_9b237a1f-16c2-4992-8910-ca0f655f3e78.jpg?v=1773691637",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-4_a42e1df4-1e82-4fab-90d7-cf7e71c1d055.jpg?v=1773691637",
    ],
    specs: { Brand: "SS", Willow: "Kashmir Willow", Level: "Beginner", Type: "Bat" },
  },
  {
    slug: "spartan-bum-bhole",
    name: "Spartan Bum Bhole Cricket Bat",
    description: "Spartan Bum Bhole — a hard-hitting bat designed to deliver maximum power. Ideal for middle-order batsmen looking for a big pick-up and strong spine.",
    priceMinor: 300000,
    category: "cricket-bats",
    stock: 18,
    rating: 4.2,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-1_44597ae0-73c4-41af-b020-ec137acdf8d6.jpg?v=1774156020",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-3_c4879b42-0ed3-4ca8-964f-ef61fc418292.jpg?v=1774156020",
    ],
    specs: { Brand: "Spartan", Willow: "Kashmir Willow", Level: "Club", Type: "Bat" },
  },
  {
    slug: "sg-cobra-icon",
    name: "SG Cobra Icon Cricket Bat",
    description: "SG Cobra Icon — a budget-friendly Kashmir willow bat with an iconic design. Great starter bat for academy players stepping into competitive cricket.",
    priceMinor: 260000,
    category: "cricket-bats",
    stock: 30,
    rating: 4.1,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/rn-image_picker_lib_temp_ae4d100f-68b6-4002-a7b1-5940107028c5.jpg?v=1746945032",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/rn-image_picker_lib_temp_ba320559-900b-42c4-a953-3a47e9b6a082.jpg?v=1746945032",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/rn-image_picker_lib_temp_b39ae013-eb51-452f-aa9b-7be93989a48d.jpg?v=1746945032",
    ],
    specs: { Brand: "SG", Willow: "Kashmir Willow", Level: "Beginner", Type: "Bat" },
  },
  {
    slug: "sg-hp-flicker",
    name: "SG HP Flicker Cricket Bat",
    description: "SG HP Flicker — slim-handle, light pick-up, great for quick footwork and wristy strokes. A popular choice for young and emerging cricketers.",
    priceMinor: 270000,
    category: "cricket-bats",
    stock: 28,
    rating: 4.1,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-05-22at1.26.49PM.jpg?v=1779436859",
    ],
    specs: { Brand: "SG", Willow: "Kashmir Willow", Level: "Beginner", Type: "Bat" },
  },
  {
    slug: "sg-rp-plus",
    name: "SG RP Plus Cricket Bat",
    description: "SG RP Plus — reliable school-and-club bat with a natural pick-up. Well-balanced for developing batting technique at every age group.",
    priceMinor: 260000,
    category: "cricket-bats",
    stock: 35,
    rating: 4.0,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-05-21at5.59.36PM.jpg?v=1779436067",
    ],
    specs: { Brand: "SG", Willow: "Kashmir Willow", Level: "Beginner", Type: "Bat" },
  },
  {
    slug: "spartan-super-volley-4no",
    name: "Spartan Super Volley 4 No. (Full Size)",
    description: "Spartan Super Volley full-size bat — hard-hitting profile for street, tape-ball, and practice cricket. Durable build at an unbeatable price.",
    priceMinor: 90000,
    category: "cricket-bats",
    stock: 50,
    rating: 3.9,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/rn-image_picker_lib_temp_fb2389e0-11fb-4b1d-a2d9-463cc46d7be4.jpg?v=1777105837",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/rn-image_picker_lib_temp_08efbd44-c0fb-44ac-bf4d-4a362ec984a6.jpg?v=1777105837",
    ],
    specs: { Brand: "Spartan", Willow: "Kashmir Willow", Level: "Beginner", Type: "Bat" },
  },
  {
    slug: "ss-plastic-bat",
    name: "SS Plastic Practice Bat",
    description: "SS plastic cricket bat — lightweight and durable for indoor practice and beginners learning the basics. Great for garden and corridor cricket.",
    priceMinor: 45000,
    category: "cricket-bats",
    stock: 80,
    rating: 3.8,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/shopping_a2b3edb9-cbdd-4bf5-bb93-d6d0bc34a17c.webp?v=1778945409",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/shopping_c584f71f-4e24-4e2b-a03c-821aed13c99c.webp?v=1778945417",
    ],
    specs: { Brand: "SS", Willow: "Plastic", Level: "Beginner", Type: "Bat" },
  },

  // ── Combos & Full Kits ────────────────────────────────────────
  {
    slug: "sg-full-kit-7000",
    name: "SG Full Cricket Kit ₹7000",
    description: "Complete SG cricket kit — bat, pads, gloves, helmet, kit bag, and accessories all in one deal. Best value for players stepping up to serious competitive cricket.",
    priceMinor: 700000,
    category: "combos",
    featured: true,
    stock: 10,
    rating: 4.6,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-05-22at5.25.05PM.jpg?v=1779451099",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-05-22_at_4.49.50_PM.jpg?v=1779451344",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-05-22_at_4.49.52_PM.jpg?v=1779451364",
    ],
    specs: { Brand: "SG", Includes: "Bat + Pads + Gloves + Helmet + Bag", Level: "Club" },
  },
  {
    slug: "economical-kit-5400",
    name: "Economical Cricket Kit ₹5400",
    description: "Budget-friendly complete cricket kit at an incredible price. Includes bat, pads, gloves, and a bag — everything a beginner needs to get on the pitch.",
    priceMinor: 539900,
    category: "combos",
    featured: true,
    stock: 15,
    rating: 4.3,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-06-11at6.58.15PM.jpg?v=1781184862",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-06-11_at_6.58.14_PM.jpg?v=1781184905",
    ],
    specs: { Brand: "Mixed", Includes: "Bat + Pads + Gloves + Bag", Level: "Beginner" },
  },
  {
    slug: "360-legacy-combo",
    name: "360 Legacy Combo (Bat + Pads + Gloves)",
    description: "360 Legacy bat paired with matching batting pads and gloves — a complete protection combo for club cricketers at a sharp price.",
    priceMinor: 399900,
    category: "combos",
    featured: true,
    stock: 20,
    rating: 4.4,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-06-02at5.37.07PM.jpg?v=1780402285",
    ],
    specs: { Brand: "360", Includes: "Bat + Pads + Gloves", Level: "Club" },
  },

  // ── Kit Bags ──────────────────────────────────────────────────
  {
    slug: "sf-vi-25-kit-bag",
    name: "SF Vi-25 Cricket Kit Bag",
    description: "SF Vi-25 premium kit bag with multiple compartments for bats, pads, helmets, and accessories. Durable polyester with padded shoulder straps.",
    priceMinor: 500000,
    category: "kit-bags",
    featured: true,
    stock: 12,
    rating: 4.5,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/rn-image_picker_lib_temp_4a4aea4e-a8cc-45eb-a046-35ee90600395.webp?v=1774925021",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/rn-image_picker_lib_temp_55c02d44-bd62-44b0-ae1f-413855c43866.webp?v=1774925021",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/rn-image_picker_lib_temp_8a900de5-9e1d-49f5-85a0-87cc63d2bcfc.webp?v=1774925022",
    ],
    specs: { Brand: "SF", Type: "Duffle Bag", Colour: "Blue/Black" },
  },
  {
    slug: "spartan-fightor-x1000-kit-bag",
    name: "Spartan Fightor X1000 Cricket Kit Bag",
    description: "Spartan Fightor X1000 — heavy-duty kit bag with reinforced base and multiple bat pockets. Designed for the serious club cricketer who demands durability.",
    priceMinor: 500000,
    category: "kit-bags",
    stock: 10,
    rating: 4.4,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-05-31at2.24.50PM.jpg?v=1780217918",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-05-31_at_2.24.50_PM.jpg?v=1780217958",
    ],
    specs: { Brand: "Spartan", Type: "Duffle Bag", Colour: "Black" },
  },
  {
    slug: "triumph-ultra-max-wheel-kit-bag",
    name: "Triumph Ultra Max Wheelie Kit Bag",
    description: "Triumph Ultra Max wheelie kit bag — travel with ease on smooth-rolling wheels. Spacious interior with a dedicated bat sleeve and waterproof exterior.",
    priceMinor: 250000,
    category: "kit-bags",
    featured: true,
    stock: 14,
    rating: 4.3,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-05-31at2.11.55PM.jpg?v=1780217434",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-05-31_at_2.16.53_PM_1.jpg?v=1780217497",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-05-31_at_2.16.53_PM.jpg?v=1780217510",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-05-31_at_2.16.54_PM_1.jpg?v=1780217519",
    ],
    specs: { Brand: "Triumph", Type: "Wheelie Bag", Colour: "Black/Red" },
  },
  {
    slug: "sf-cobra-2-0-wheel-kit-bag",
    name: "SF Cobra 2.0 Wheelie Kit Bag",
    description: "SF Cobra 2.0 wheelie kit bag with rugged all-terrain wheels and a reinforced bat tunnel. Great for teams and regular travellers.",
    priceMinor: 200000,
    category: "kit-bags",
    stock: 18,
    rating: 4.2,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/IMG-2695_1220x_crop_center_4d128f5d-24bf-4383-92f5-db1f82492ecc.webp?v=1762940065",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/COBRA_2.0.webp?v=1762940404",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/COO2.0.webp?v=1762940407",
    ],
    specs: { Brand: "SF", Type: "Wheelie Bag", Colour: "Black" },
  },
  {
    slug: "no-1-kit-bag-wheels",
    name: "No.1 Kit Bag With Wheels",
    description: "A Sports Zone's value pick — a full-size wheelie kit bag that holds two full-size bats, pads, gloves, and accessories comfortably. Ideal for budget-conscious players.",
    priceMinor: 179900,
    category: "kit-bags",
    stock: 25,
    rating: 4.0,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-06-10at6.25.16PM.jpg?v=1781096827",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-06-11_at_2.45.45_PM.jpg?v=1781169620",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-06-11_at_2.45.45_PM_2494544d-7291-4588-aa00-56f3afcf275a.jpg?v=1781169658",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-06-11_at_2.45.45_PM_f0a0a0a2-f82f-4a2d-8d07-ebd5aa22ef7f.jpg?v=1781169714",
    ],
    specs: { Brand: "No.1", Type: "Wheelie Bag", Colour: "Black" },
  },

  // ── Cricket Shoes ─────────────────────────────────────────────
  {
    slug: "rxn-victor-cricket-spikes",
    name: "RXN Victor Cricket Spikes Shoes",
    description: "RXN Victor spike shoes designed for grass pitches. Rigid spike sole gives you the grip and stability to bowl and bat at full intensity.",
    priceMinor: 180000,
    category: "cricket-shoes",
    featured: true,
    stock: 20,
    rating: 4.3,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-05-26at6.29.46PM.jpg?v=1779800793",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-05-26_at_6.31.46_PM.jpg?v=1779800816",
    ],
    specs: { Brand: "RXN", Sole: "Spike", Surface: "Grass", Type: "Cricket Shoes" },
  },
  {
    slug: "rxn-victor-cricket-shoes",
    name: "RXN Victor Cricket Shoes",
    description: "RXN Victor rubber-sole cricket shoes — versatile grip for turf, synthetic, and indoor pitches. Lightweight upper for all-day comfort during long matches.",
    priceMinor: 119900,
    category: "cricket-shoes",
    stock: 30,
    rating: 4.1,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-06-04at3.40.07PM.jpg?v=1780567954",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-06-04_at_3.40.31_PM.jpg?v=1780567973",
    ],
    specs: { Brand: "RXN", Sole: "Rubber", Surface: "Turf", Type: "Cricket Shoes" },
  },
  {
    slug: "no-1-cricket-shoes",
    name: "No.1 Cricket Shoes",
    description: "No.1 entry-level cricket shoes — affordable footwear with a grippy rubber sole for beginners and practice use. Easy lace-up design and comfortable fit.",
    priceMinor: 59900,
    category: "cricket-shoes",
    stock: 50,
    rating: 3.9,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/Gemini_Generated_Image_bse9pubse9pubse9.png?v=1771653531",
    ],
    specs: { Brand: "No.1", Sole: "Rubber", Surface: "Turf", Type: "Cricket Shoes" },
  },

  // ── More Cricket Bats ─────────────────────────────────────────
  {
    slug: "bdm-super-jock-ew",
    name: "BDM Super Jock English Willow Cricket Bat",
    description: "BDM Super Jock — nurtured English willow with a premium spine and full profile. Crafted for batsmen who demand feel, balance, and big edges in equal measure.",
    priceMinor: 499900,
    category: "cricket-bats",
    featured: true,
    stock: 10,
    rating: 4.5,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/3_808_1.jpg",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/1_845_1.jpg",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/2_821_1.jpg",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/4_751_1.jpg",
    ],
    specs: { Brand: "BDM", Willow: "English Willow", Level: "Professional", Type: "Bat" },
  },
  {
    slug: "bdm-morning-star-ew",
    name: "BDM Morning Star Nurtured English Willow Cricket Bat",
    description: "BDM Morning Star — nurtured English willow with a pronounced middle, designed for classical stroke-play and aggressive top-order batting.",
    priceMinor: 449900,
    category: "cricket-bats",
    featured: true,
    stock: 12,
    rating: 4.4,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/rn-image_picker_lib_temp_e8ad010a-c437-4ed8-8fe3-72d26d33b21c.png",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/rn-image_picker_lib_temp_ce744852-eb51-4e1d-a6e7-7eb522e7e735.png",
    ],
    specs: { Brand: "BDM", Willow: "English Willow", Level: "Professional", Type: "Bat" },
  },
  {
    slug: "bdm-punch-ew",
    name: "BDM Punch Nurtured English Willow Cricket Bat",
    description: "BDM Punch — compact, punchy English willow bat with a low sweet spot. Built for the player who lives on back-foot cuts and pulls.",
    priceMinor: 419900,
    category: "cricket-bats",
    stock: 14,
    rating: 4.3,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/ChatGPTImageFeb13_2026_01_53_13PM.png",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/ChatGPTImageFeb13_2026_01_57_25PM.png",
    ],
    specs: { Brand: "BDM", Willow: "English Willow", Level: "Club", Type: "Bat" },
  },
  {
    slug: "hammer-x-engraved",
    name: "Hammer-X Engraved Premium Willow Cricket Bat",
    description: "Hammer-X Engraved — premium willow bat with custom laser engraving. A powerful hitter's weapon with a thick edge and a deep sweet spot for maximum transfer.",
    priceMinor: 449900,
    category: "cricket-bats",
    stock: 15,
    rating: 4.3,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/51wNgpg5BrL._SX679.jpg",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/41iPdhecYGL._SX679.jpg",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/41xTiszH4UL._SX679.jpg",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/61Noe24Q5GL._SX679.jpg",
    ],
    specs: { Brand: "Hammer-X", Willow: "Premium Willow", Level: "Club", Type: "Bat" },
  },
  {
    slug: "sg-thunder-plus-kashmir",
    name: "SG Thunder Plus Kashmir Willow Cricket Bat",
    description: "SG Thunder Plus — Kashmir willow bat with a full blade profile and solid pick-up. Ideal for players looking for a reliable performance bat at a great value.",
    priceMinor: 240000,
    category: "cricket-bats",
    stock: 22,
    rating: 4.1,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/Screenshot2025-07-16at6.32.25PM.png",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/Screenshot2025-07-16at6.32.21PM.png",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/Screenshot2025-07-16at6.32.16PM.png",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/Screenshot2025-07-16at6.32.12PM.png",
    ],
    specs: { Brand: "SG", Willow: "Kashmir Willow", Level: "Beginner", Type: "Bat" },
  },
  {
    slug: "spartan-chris-gayle-rdx",
    name: "Spartan Chris Gayle RDX Kashmir Willow Cricket Bat",
    description: "Spartan Chris Gayle RDX — inspired by the Universe Boss. Oversized blade, extra-thick edge, and a power-loaded sweet spot for explosive 360° batting.",
    priceMinor: 289900,
    category: "cricket-bats",
    stock: 18,
    rating: 4.2,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/71SvrwwhckL._SX679.jpg",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/61FcTJ-xsPL._SY879.jpg",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/619Wym-zu4L._SX679.jpg",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/61B4e_keusL._SX679.jpg",
    ],
    specs: { Brand: "Spartan", Willow: "Kashmir Willow", Level: "Club", Type: "Bat" },
  },
  {
    slug: "spartan-king-bat",
    name: "Spartan King Bat Kashmir Willow",
    description: "Spartan King Bat — a Kashmir willow blade that rules the crease. Premium pick-up with a mid-sized sweet spot, suited to all playing styles.",
    priceMinor: 299900,
    category: "cricket-bats",
    stock: 16,
    rating: 4.2,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/KING_ddb5bae1-fea4-4c57-bac4-b5449679762b.webp",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/KING_3.webp",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/KING_2.webp",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/KING_1.webp",
    ],
    specs: { Brand: "Spartan", Willow: "Kashmir Willow", Level: "Club", Type: "Bat" },
  },
  {
    slug: "spartan-sikander-1000",
    name: "Spartan Sikander 1000 Kashmir Willow Cricket Bat",
    description: "Spartan Sikander 1000 — a warrior on the pitch. Strong Kashmir willow spine, full profile, and a low sweet spot for slog-sweep domination.",
    priceMinor: 329900,
    category: "cricket-bats",
    stock: 14,
    rating: 4.3,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/Sikander1000CB181.webp",
    ],
    specs: { Brand: "Spartan", Willow: "Kashmir Willow", Level: "Club", Type: "Bat" },
  },

  // ── More Combos ───────────────────────────────────────────────
  {
    slug: "ss-master-100-combo",
    name: "SS Master 100 Kashmir Willow Bat Combo (Gloves + Arm Thrower)",
    description: "SS Master 100 Kashmir willow bat bundled with batting gloves and an arm thrower — everything you need for a complete practice session, at an unbeatable price.",
    priceMinor: 249900,
    category: "combos",
    stock: 20,
    rating: 4.2,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/Gemini_Generated_Image_rga5crrga5crrga5.png?v=1769587616",
    ],
    specs: { Brand: "SS", Includes: "Bat + Gloves + Arm Thrower", Level: "Beginner" },
  },
  {
    slug: "360-legacy-kit-with-shoes",
    name: "360 Legacy Cricket Bat Combo Kit (Shoes + Gloves + Arm Thrower)",
    description: "360 Legacy combo kit — bat, shoes, batting gloves, and an arm thrower in one deal. Perfect for the player building their first serious cricket setup.",
    priceMinor: 319900,
    category: "combos",
    stock: 15,
    rating: 4.3,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/ChatGPTImageJan30_2026_04_56_38PM.png",
    ],
    specs: { Brand: "360", Includes: "Bat + Shoes + Gloves + Arm Thrower", Level: "Beginner" },
  },
  {
    slug: "rns-t20-combo",
    name: "RNS T20 English Willow + Free Rinku Singh Bat, Arm Thrower & Ball Combo",
    description: "RNS T20 English willow bat + a free Rinku Singh signature bat + arm thrower + soft tennis ball. The ultimate value pack for T20 training and match play.",
    priceMinor: 419900,
    category: "combos",
    featured: true,
    stock: 12,
    rating: 4.5,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/Gemini_Generated_Image_lb7vj4lb7vj4lb7v_1.png",
    ],
    specs: { Brand: "RNS", Includes: "2 Bats + Arm Thrower + Ball", Willow: "English Willow", Level: "Club" },
  },
  {
    slug: "spartan-4-in-1-pro-combo",
    name: "Spartan 4-in-1 Pro Combo (Boss Bat + Pads + Gloves + Sidearm)",
    description: "Spartan 4-in-1 Pro Combo — Boss bat, batting pads, gloves, and a sidearm thrower in one kit. Maximum value for the cricketer who wants it all.",
    priceMinor: 349900,
    category: "combos",
    stock: 14,
    rating: 4.3,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/Gemini_Generated_Image_lc9coslc9coslc9c.png",
    ],
    specs: { Brand: "Spartan", Includes: "Bat + Pads + Gloves + Sidearm", Level: "Club" },
  },

  // ── Batting Protection ────────────────────────────────────────
  {
    slug: "no-1-molded-batting-pads",
    name: "No.1 Molded Batting Pads",
    description: "No.1 molded batting pads with high-density foam bolsters and triple-strap Velcro closure. Solid protection for club cricketers at an accessible price.",
    priceMinor: 180000,
    category: "batting-protection",
    featured: true,
    stock: 20,
    rating: 4.2,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-05-21at4.11.33PM_1.jpg?v=1779360178",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-05-21_at_4.11.33_PM_1.jpg?v=1779360269",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-05-21_at_4.11.33_PM_2.jpg?v=1779360269",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-05-21_at_4.11.33_PM.jpg?v=1779360269",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-05-21_at_4.11.34_PM_1.jpg?v=1779360269",
    ],
    specs: { Brand: "No.1", Hand: "Right Hand", Type: "Batting Pads", Level: "Club" },
  },
  {
    slug: "sf-como-adi-3-batting-gloves",
    name: "SF Como Adi-3 Batting Gloves",
    description: "SF Como Adi-3 batting gloves with reinforced knuckle guard and premium grip palm. Ergonomic design for a snug, responsive feel at the crease.",
    priceMinor: 140000,
    category: "batting-protection",
    featured: true,
    stock: 25,
    rating: 4.2,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-1_4064c57d-b944-4bc9-9be2-4b796c67d98c.jpg?v=1774282332",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-2_72f0d3b1-26b4-49e0-ae2f-d549cae78a3c.jpg?v=1774282332",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-4_5d790f68-92ad-453f-b5c9-d9e6364d09ec.jpg?v=1774282332",
    ],
    specs: { Brand: "SF", Hand: "Right Hand", Type: "Batting Gloves", Level: "Club" },
  },
  {
    slug: "no1-batting-gloves",
    name: "No.1 Batting Gloves",
    description: "No.1 batting gloves with padded finger rolls and a Velcro wrist strap. Dependable protection for school and club cricketers at a great price.",
    priceMinor: 129900,
    category: "batting-protection",
    stock: 35,
    rating: 4.0,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsAppImage2026-06-11at5.53.56PM.jpg?v=1781180717",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-06-11_at_5.53.57_PM.jpg?v=1781180814",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/WhatsApp_Image_2026-06-11_at_5.53.56_PM.jpg?v=1781180858",
    ],
    specs: { Brand: "No.1", Hand: "Right Hand", Type: "Batting Gloves", Level: "Beginner" },
  },
  {
    slug: "sf-wicket-keeping-gloves-adi",
    name: "SF Wicket Keeping Gloves (Adi)",
    description: "SF Adi wicket-keeping gloves with padded fingers and a cushioned palm for safe catching. Lightweight design for fast, agile glovework behind the stumps.",
    priceMinor: 120000,
    category: "batting-protection",
    stock: 20,
    rating: 4.1,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-1_1bd66ddf-0987-408c-95ef-d5fa312a23fd.jpg?v=1774607923",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-3_9601e068-ed16-4c3d-b66a-2bda38af67fc.jpg?v=1774607923",
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-4_724336c1-0d17-4658-86e6-e7567b027561.jpg?v=1774607923",
    ],
    specs: { Brand: "SF", Type: "Wicket Keeping Gloves", Level: "Club" },
  },

  // ── Accessories ───────────────────────────────────────────────
  {
    slug: "knocking-hammer-pro",
    name: "Knocking Hammer (Pro)",
    description: "Professional-grade cricket bat knocking hammer with a solid rubber head for even pressure distribution. Knock in your new bat properly and extend its lifespan.",
    priceMinor: 59900,
    category: "accessories",
    stock: 60,
    rating: 4.3,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/ChatGPTImageFeb13_2026_11_51_51AM.png",
    ],
    specs: { Brand: "A Sports Zone", Type: "Knocking Hammer", Use: "Bat Preparation" },
  },
  {
    slug: "knocking-hammer",
    name: "Knocking Hammer",
    description: "Entry-level cricket bat knocking hammer — the essential tool for preparing a new bat. Light and easy to handle, suitable for all ages.",
    priceMinor: 19900,
    category: "accessories",
    stock: 100,
    rating: 4.0,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/ChatGPTImageFeb13_2026_11_49_16AM.png",
    ],
    specs: { Brand: "A Sports Zone", Type: "Knocking Hammer", Use: "Bat Preparation" },
  },
  {
    slug: "sf-ranger-cricket-socks",
    name: "SF Ranger Cricket Socks (Ankle / Full)",
    description: "SF Ranger cricket socks — moisture-wicking fabric with reinforced heel and toe. Available in ankle or full length for all-day comfort during long innings.",
    priceMinor: 20900,
    category: "accessories",
    stock: 150,
    rating: 4.2,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/BLACK-1-570x570.webp",
    ],
    specs: { Brand: "SF", Type: "Cricket Socks", Colour: "Black" },
  },
  {
    slug: "black-panther-maxx-socks",
    name: "Black Panther Maxx Socks",
    description: "Black Panther Maxx performance socks — cushioned sole, anti-odour treatment, and a snug fit that stays in place through every over.",
    priceMinor: 11900,
    category: "accessories",
    stock: 200,
    rating: 4.1,
    images: [
      "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/ChatGPTImageFeb13_2026_11_45_20AM.png",
    ],
    specs: { Brand: "Black Panther", Type: "Cricket Socks", Colour: "Black" },
  },
];

async function main() {
  const tenantSlug = process.env.DEFAULT_TENANT_SLUG ?? "default";

  const tenant = await prisma.tenant.upsert({
    where: { slug: tenantSlug },
    update: { name: "A Sports Zone" },
    create: { slug: tenantSlug, name: "A Sports Zone" },
  });

  const store = await prisma.store.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "main" } },
    update: { name: "A Sports Zone — Cricket & Sports Store" },
    create: {
      tenantId: tenant.id,
      name: "A Sports Zone — Cricket & Sports Store",
      slug: "main",
      settings: { create: { defaultCurrency: "INR", defaultLocale: "en" } },
    },
  });

  // ── Users ──────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@12345", 10);
  const custHash = await bcrypt.hash("Customer@12345", 10);
  await prisma.user.upsert({
    where: { email: "admin@nova.test" },
    update: {},
    create: { email: "admin@nova.test", name: "Store Admin", role: Role.ADMIN, passwordHash: adminHash, tenantId: tenant.id },
  });
  await prisma.user.upsert({
    where: { email: "customer@nova.test" },
    update: {},
    create: { email: "customer@nova.test", name: "Demo Customer", role: Role.CUSTOMER, passwordHash: custHash, tenantId: tenant.id },
  });

  // ── Clear existing commerce + catalog data ──────────────────
  // Must follow FK order: payments → order items → orders → cart items → carts → products → categories
  await prisma.payment.deleteMany({ where: { order: { tenantId: tenant.id } } });
  await prisma.orderItem.deleteMany({ where: { order: { tenantId: tenant.id } } });
  await prisma.order.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.cartItem.deleteMany({ where: { cart: { tenantId: tenant.id } } });
  await prisma.cart.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.product.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.category.deleteMany({ where: { tenantId: tenant.id } });

  // ── Categories ─────────────────────────────────────────────
  const catBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const cat = await prisma.category.create({
      data: { tenantId: tenant.id, slug: c.slug, name: c.name, description: c.description, imageUrl: c.imageUrl },
    });
    catBySlug.set(c.slug, cat.id);
  }

  // ── Products ───────────────────────────────────────────────
  // All images are real Shopify CDN URLs — no placeholders to filter.
  const FALLBACK_CATEGORIES = new Set([
    "cricket-bats", "combos", "kit-bags", "cricket-shoes", "batting-protection", "accessories",
  ]);
  const catImageBySlug = new Map(CATEGORIES.map((c) => [c.slug, c.imageUrl]));
  const isPlaceholder = (url: string) =>
    /picsum\.photos|placeholder|via\.placeholder|dummyimage|placehold\.co/i.test(url);

  for (const p of PRODUCTS) {
    const realImages = p.images.filter((u) => !isPlaceholder(u));
    const fallback = FALLBACK_CATEGORIES.has(p.category) ? catImageBySlug.get(p.category) : undefined;
    const images = realImages.length ? realImages : fallback ? [fallback] : [];

    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: catBySlug.get(p.category)!,
        slug: p.slug,
        name: p.name,
        description: p.description,
        priceMinor: p.priceMinor,
        currency: "INR",
        featured: p.featured ?? false,
        rating: p.rating ?? (Math.round((4 + Math.random() * 0.9) * 10) / 10),
        images: {
          create: images.map((url, i) => ({ url, alt: p.name, position: i })),
        },
        variants: {
          create: [
            {
              sku: `${p.slug}-default`,
              name: "Standard",
              optionsJson: {},
              inventory: { create: { quantity: p.stock ?? 50, lowStockThreshold: 5 } },
            },
          ],
        },
      },
    });

    if (Object.keys(p.specs).length > 0) {
      await prisma.productSpec.createMany({
        data: Object.entries(p.specs).map(([key, value]) => ({ productId: product.id, key, value })),
      });
    }
  }

  // ── Feature flags ─────────────────────────────────────────
  for (const [key, enabled, description] of [
    ["ai_assistant", false, "Floating AI shopping assistant"],
    ["ai_search", false, "Semantic AI search"],
    ["reviews", true, "Product reviews"],
    ["referrals", false, "Referral program"],
    ["loyalty", false, "Loyalty points program"],
  ] as const) {
    await prisma.featureFlag.upsert({
      where: { key },
      update: {},
      create: { key, enabled, description },
    });
  }

  // ── Coupons ────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "CRICKET10" } },
    update: {},
    create: { tenantId: tenant.id, code: "CRICKET10", type: "PERCENT", value: 10, minSpendMinor: 0, active: true },
  });
  await prisma.coupon.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "FREESHIP" } },
    update: {},
    create: { tenantId: tenant.id, code: "FREESHIP", type: "FREE_SHIPPING", value: 0, minSpendMinor: 0, active: true },
  });
  await prisma.coupon.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "KIT500" } },
    update: {},
    create: { tenantId: tenant.id, code: "KIT500", type: "FIXED", value: 50000, minSpendMinor: 300000, active: true },
  });

  // ── Demo customer loyalty ──────────────────────────────────
  const customer = await prisma.user.findUnique({ where: { email: "customer@nova.test" } });
  if (customer) {
    await prisma.user.update({ where: { id: customer.id }, data: { referralCode: "ASZ-DEMO" } });
    await prisma.loyaltyAccount.upsert({
      where: { userId: customer.id },
      update: {},
      create: { userId: customer.id, points: 0 },
    });
  }

  // ── Demo gift card ─────────────────────────────────────────
  await prisma.giftCard.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "GC-CRICKET-1000" } },
    update: {},
    create: { tenantId: tenant.id, code: "GC-CRICKET-1000", initialMinor: 100000, balanceMinor: 100000, currency: "INR", active: true },
  });

  // ── Supplier ───────────────────────────────────────────────
  await prisma.supplier.upsert({
    where: { id: "seed-supplier-asz" },
    update: {},
    create: { id: "seed-supplier-asz", tenantId: tenant.id, name: "A Sports Zone Distributors", email: "trade@asportszone.com" },
  });

  // ── Trust posts (Where The Trust Builds) ────────────────────
  // Add a few demo posts so the storefront "Where The Trust Builds" section appears
  await prisma.trustPost.upsert({
    where: { id: "seed-trust-video-1" },
    update: {},
    create: {
      id: "seed-trust-video-1",
      tenantId: tenant.id,
      type: "VIDEO",
      title: "Real Player Review: EM Pro Player",
      caption: "Unboxing and first impressions from a club cricketer.",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      position: 0,
      active: true,
    },
  });

  await prisma.trustPost.upsert({
    where: { id: "seed-trust-short-1" },
    update: {},
    create: {
      id: "seed-trust-short-1",
      tenantId: tenant.id,
      type: "SHORT",
      title: "On the Pitch Highlights",
      caption: "Quick customer clips showcasing the gear in action.",
      url: "https://youtu.be/3JZ_D3ELwOQ",
      thumbnail: "https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg",
      position: 1,
      active: true,
    },
  });

  await prisma.trustPost.upsert({
    where: { id: "seed-trust-photo-1" },
    update: {},
    create: {
      id: "seed-trust-photo-1",
      tenantId: tenant.id,
      type: "PHOTO",
      title: "Customer Match Day",
      caption: "Fans sharing match day photos with our kit.",
      url: "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-1.webp?v=1773746302",
      thumbnail: "https://cdn.shopify.com/s/files/1/0606/5386/2996/files/product-image-1.webp?v=1773746302",
      position: 2,
      active: true,
    },
  });

  console.log(
    `✔ Seeded A Sports Zone store: ${PRODUCTS.length} products across ${CATEGORIES.length} categories.`,
  );
  console.log(`  Admin: admin@nova.test / Admin@12345`);
  console.log(`  Customer: customer@nova.test / Customer@12345`);
  console.log(`  Coupons: CRICKET10 (10% off) · FREESHIP · KIT500 (₹500 off ₹3k+)`);
  console.log(`  Gift card: GC-CRICKET-1000 (₹1,000)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
