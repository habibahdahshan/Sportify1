require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const products = [
  // ---- MEN ----
  {
    name: "Men's Essentials Cotton Tank Top",
    description: "A breathable cotton tank built for everyday training and warm-weather runs.",
    line: "Men Essentials",
    category: "men",
    type: "apparel",
    image: "/User/media/men/men-essentials-cotton-tank-top.jpg",
    sizes: [
      { size: "S", price: 350, stock: 12 },
      { size: "M", price: 350, stock: 18 },
      { size: "L", price: 380, stock: 10 }
    ],
    isFeatured: true
  },
  {
    name: "Men's Essentials Flexi Short",
    description: "Lightweight stretch shorts with a relaxed fit for training and recovery days.",
    line: "Men Essentials",
    category: "men",
    type: "apparel",
    image: "/User/media/men/men-essentials-flexi-short.jpg",
    sizes: [
      { size: "S", price: 420, stock: 8 },
      { size: "M", price: 420, stock: 15 },
      { size: "L", price: 450, stock: 9 }
    ]
  },
  {
    name: "Men's NordX Compression Long Sleeve Tee",
    description: "Compression-fit long sleeve for cold-weather training with moisture-wicking fabric.",
    line: "Men NordX",
    category: "men",
    type: "apparel",
    image: "/User/media/men/men-nordx-compression-long-sleeve-tee.jpg",
    sizes: [
      { size: "S", price: 590, stock: 6 },
      { size: "M", price: 590, stock: 14 },
      { size: "L", price: 620, stock: 7 }
    ],
    isBestSeller: true
  },
  {
    name: "Men's NordX Track Jacket",
    description: "Wind-resistant track jacket with a full zip and ribbed cuffs for layering on cool days.",
    line: "Men NordX",
    category: "men",
    type: "apparel",
    image: "/User/media/men/men-nordx-track-jacket.jpg",
    sizes: [
      { size: "M", price: 950, stock: 10 },
      { size: "L", price: 990, stock: 8 },
      { size: "XL", price: 990, stock: 5 }
    ],
    isFeatured: true,
    isFlashSale: true
  },
  {
    name: "Men's Strive Quick-Dry Tank Top",
    description: "Ultra-light quick-dry tank engineered for high-intensity training sessions.",
    line: "Men Strive",
    category: "men",
    type: "apparel",
    image: "/User/media/men/men-strive-quick-dry-tank-top.jpg",
    sizes: [
      { size: "S", price: 400, stock: 11 },
      { size: "M", price: 400, stock: 16 },
      { size: "L", price: 430, stock: 8 }
    ],
    isBestSeller: true
  },

  // ---- WOMEN ----
  {
    name: "Women's Essentials Cotton Short Sleeve",
    description: "Soft cotton short-sleeve tee designed for everyday comfort and light training.",
    line: "Women Essentials",
    category: "women",
    type: "apparel",
    image: "/User/media/women/women-essentials-cotton-short-sleeve.jpg",
    sizes: [
      { size: "XS", price: 360, stock: 9 },
      { size: "S", price: 360, stock: 14 },
      { size: "M", price: 380, stock: 12 }
    ],
    isFeatured: true
  },
  {
    name: "Women's Essentials Dri-Fit Long Fit",
    description: "Dri-fit long-fit top that keeps you cool and dry through longer sessions.",
    line: "Women Essentials",
    category: "women",
    type: "apparel",
    image: "/User/media/women/women-essentials-drifit-long-fit.jpg",
    sizes: [
      { size: "S", price: 480, stock: 10 },
      { size: "M", price: 480, stock: 13 },
      { size: "L", price: 510, stock: 6 }
    ]
  },
  {
    name: "Women's Essentials Dri-Fit Long Sleeve",
    description: "Long-sleeve dri-fit layer for cooler runs and outdoor training.",
    line: "Women Essentials",
    category: "women",
    type: "apparel",
    image: "/User/media/women/women-essentials-drifit-long-sleeve.jpg",
    sizes: [
      { size: "S", price: 520, stock: 7 },
      { size: "M", price: 520, stock: 12 },
      { size: "L", price: 550, stock: 5 }
    ],
    isFlashSale: true
  },
  {
    name: "Women's Essentials Dri-Fit Short Sleeve",
    description: "Breathable short-sleeve dri-fit tee ideal for studio classes and daily wear.",
    line: "Women Essentials",
    category: "women",
    type: "apparel",
    image: "/User/media/women/women-essentials-drifit-short-sleeve.jpg",
    sizes: [
      { size: "XS", price: 400, stock: 10 },
      { size: "S", price: 400, stock: 14 },
      { size: "M", price: 420, stock: 9 }
    ],
    isBestSeller: true
  },
  {
    name: "Women's Essentials Flexi Wide Leg",
    description: "Wide-leg stretch pants with a high waistband, built for comfort on and off the mat.",
    line: "Women Essentials",
    category: "women",
    type: "apparel",
    image: "/User/media/women/women-essentials-flexi-wide-leg.png",
    sizes: [
      { size: "S", price: 650, stock: 8 },
      { size: "M", price: 650, stock: 10 },
      { size: "L", price: 680, stock: 6 }
    ],
    isFeatured: true
  },
  {
    name: "Women's Prime-R Long Fit T-Shirt",
    description: "Relaxed long-fit tee from the Prime-R line, made for everyday layering.",
    line: "Women Prime-R",
    category: "women",
    type: "apparel",
    image: "/User/media/women/women-prime-r-long-fit-tshirt.png",
    sizes: [
      { size: "S", price: 430, stock: 9 },
      { size: "M", price: 430, stock: 11 },
      { size: "L", price: 460, stock: 7 }
    ]
  },

  // ---- UNISEX ----
  {
    name: "Unisex Cross Bag",
    description: "Compact cross-body bag with a padded strap, sized for essentials on the go.",
    line: "Unisex Accessories",
    category: "unisex",
    type: "accessories",
    image: "/User/media/unisex/unisex-cross-bag.jpg",
    sizes: [{ size: "One Size", price: 480, stock: 15 }]
  },
  {
    name: "Unisex Essentials Cotton Wide Leg",
    description: "Relaxed wide-leg cotton pants for warm-ups, travel, and everyday comfort.",
    line: "Unisex Essentials",
    category: "unisex",
    type: "apparel",
    image: "/User/media/unisex/unisex-essentials-cotton-wide-leg.jpg",
    sizes: [
      { size: "S", price: 600, stock: 8 },
      { size: "M", price: 600, stock: 10 },
      { size: "L", price: 630, stock: 6 }
    ]
  },
  {
    name: "Unisex NordX Quarter-Zip",
    description: "Midweight quarter-zip pullover for layering during cool-weather training.",
    line: "Unisex NordX",
    category: "unisex",
    type: "apparel",
    image: "/User/media/unisex/unisex-nordx-quarter-zip.webp",
    sizes: [
      { size: "M", price: 780, stock: 9 },
      { size: "L", price: 820, stock: 7 },
      { size: "XL", price: 820, stock: 4 }
    ],
    isFeatured: true,
    isFlashSale: true
  },
  {
    name: "Unisex Offcore Straight Pants",
    description: "Straight-fit training pants with a tapered ankle and durable stretch fabric.",
    line: "Unisex Offcore",
    category: "unisex",
    type: "apparel",
    image: "/User/media/unisex/unisex-offcore-straight-pants.jpg",
    sizes: [
      { size: "S", price: 700, stock: 6 },
      { size: "M", price: 700, stock: 9 },
      { size: "L", price: 730, stock: 5 }
    ]
  },
  {
    name: "Unisex Strive All-Week 6-Pack Socks",
    description: "Cushioned crew socks in a 6-pack, built to last through a full week of training.",
    line: "Unisex Strive",
    category: "unisex",
    type: "accessories",
    image: "/User/media/unisex/unisex-strive-allweek-6pack-socks.jpg",
    sizes: [{ size: "One Size", price: 250, stock: 30 }],
    isBestSeller: true
  },
  {
    name: "Unisex Strive Cap",
    description: "Structured training cap with an adjustable strap and breathable mesh panels.",
    line: "Unisex Strive",
    category: "unisex",
    type: "accessories",
    image: "/User/media/unisex/unisex-strive-cap.jpg",
    sizes: [{ size: "One Size", price: 300, stock: 20 }]
  },
  {
    name: "Unisex Strive Gym Bag",
    description: "Durable gym bag with a dedicated shoe compartment and water-resistant base.",
    line: "Unisex Strive",
    category: "unisex",
    type: "accessories",
    image: "/User/media/unisex/unisex-strive-gym-bag.jpg",
    sizes: [{ size: "One Size", price: 750, stock: 12 }],
    isFeatured: true
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sportify");
    console.log("Connected to MongoDB for seeding...");

    await Product.deleteMany({});
    console.log("Cleared existing products.");

    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products successfully.`);

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
