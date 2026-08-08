const mongoose = require("mongoose");
const Product = require("../models/Product");

exports.formatProductForStorefront = function formatProductForStorefront(doc) {
  const p = doc.toObject ? doc.toObject() : doc;
  const id = String(p._id);
  const sizes = Array.isArray(p.sizes) ? p.sizes : [];
  const inStock = sizes.some((s) => Number(s.stock) > 0);

  return {
    id,
    _id: id,
    name: p.name,
    image: p.image,
    line: p.line || `${p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : ""} ${p.type || "Apparel"}`.trim(),
    category: p.category,
    type: p.type,
    currency: p.currency || "LE",
    description: p.description || "",
    sizes: sizes.map((s) => ({
      size: s.size,
      price: s.price,
      stock: Number(s.stock) || 0,
      inStock: Number(s.stock) > 0
    })),
    baseSize: sizes.length ? sizes[0].size : "M",
    inStock,
    stock: Number(p.stock) || 0,
    isFeatured: !!p.isFeatured,
    isBestSeller: !!p.isBestSeller,
    isFlashSale: !!p.isFlashSale,
    createdAt: p.createdAt
  };
};

/* Public storefront API (AJAX) - supports pagination + filters */
exports.getStorefrontProducts = async (req, res, next) => {
  try {
    const { category, search, featured, bestSeller, flashSale } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));

    const filter = { isHidden: { $ne: true } };
    if (category && ["men", "women", "unisex"].includes(String(category).toLowerCase())) {
      filter.category = String(category).toLowerCase();
    }
    if (search) {
      filter.name = { $regex: String(search).trim(), $options: "i" };
    }
    if (featured === "1" || featured === "true") filter.isFeatured = true;
    if (bestSeller === "1" || bestSeller === "true") filter.isBestSeller = true;
    if (flashSale === "1" || flashSale === "true") filter.isFlashSale = true;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      products: products.map(exports.formatProductForStorefront)
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("pages/404", { title: "Product not found" });
    }

    const product = await Product.findById(id);
    if (!product || product.isHidden) {
      return res.status(404).render("pages/404", { title: "Product not found" });
    }

    const pageProduct = exports.formatProductForStorefront(product);

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isHidden: { $ne: true }
    }).limit(4);

    res.render("pages/product", {
      title: `${product.name} · Sportify`,
      activePage: "shop",
      pageProduct,
      related: related.map(exports.formatProductForStorefront)
    });
  } catch (err) {
    next(err);
  }
};

/* Admin JSON API for products (used by admin.js AJAX interactions if needed) */
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};
