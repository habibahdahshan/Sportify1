const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const productController = require("./productController");

function cartItemsToJson(items) {
  return (items || []).map((item) => ({
    productId: String(item.product._id || item.product),
    name: item.name || "",
    price: Number(item.price) || 0,
    qty: item.quantity || 1,
    size: item.size || "—",
    image: item.image || "",
    currency: item.currency || "LE",
    originalPrice: Number(item.originalPrice) || 0,
    isFlashSale: !!item.isFlashSale
  }));
}

function priceForSize(formatted, size) {
  const sizes = formatted.sizes || [];
  const match =
    sizes.find((s) => String(s.size).toUpperCase() === String(size).toUpperCase()) ||
    sizes.find((s) => s.size === formatted.baseSize) ||
    sizes[0];
  return match && match.price != null ? Number(match.price) : null;
}

async function refreshCartItemPrices(items) {
  const refreshed = [];
  for (const item of items || []) {
    const productId = item.product && item.product._id ? item.product._id : item.product;
    if (!productId || !mongoose.Types.ObjectId.isValid(String(productId))) continue;

    const product = await Product.findById(productId);
    if (!product || product.isHidden) continue; // drop deleted/hidden

    const formatted = productController.formatProductForStorefront(product);
    const livePrice = priceForSize(formatted, item.size);
    const sizePrices = (formatted.sizes || []).map((s) => Number(s.price) || 0);
    const originalPrice = product.isFlashSale ? (sizePrices.length ? Math.max(...sizePrices) : 0) : 0;
    const isFlashSale = !!product.isFlashSale && originalPrice > (livePrice != null ? livePrice : Number(item.price) || 0);

    refreshed.push({
      product: product._id,
      name: product.name,
      price: livePrice != null ? livePrice : Number(item.price) || 0,
      quantity: item.quantity || 1,
      size: item.size || "—",
      image: product.image || item.image || "",
      currency: item.currency || "LE",
      originalPrice: isFlashSale ? originalPrice : 0,
      isFlashSale: isFlashSale
    });
  }
  return refreshed;
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

function normalizeIncomingItem(raw) {
  if (!raw || !raw.productId) return null;
  if (!mongoose.Types.ObjectId.isValid(String(raw.productId))) return null;
  return {
    product: raw.productId,
    name: String(raw.name || "").trim(),
    price: Number(raw.price) || 0,
    quantity: Math.max(1, Number(raw.qty || raw.quantity || 1)),
    size: raw.size != null ? String(raw.size) : "—",
    image: String(raw.image || ""),
    currency: String(raw.currency || "LE"),
    originalPrice: Number(raw.originalPrice) || 0,
    isFlashSale: !!raw.isFlashSale
  };
}

exports.getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.session.user.id);
    cart.items = await refreshCartItemPrices(cart.items);
    await cart.save();
    res.json({ success: true, cart: cartItemsToJson(cart.items) });
  } catch (err) {
    next(err);
  }
};

exports.syncCart = async (req, res, next) => {
  try {
    const incoming = Array.isArray(req.body.items) ? req.body.items : [];
    const items = incoming.map(normalizeIncomingItem).filter(Boolean);
    const pricedItems = await refreshCartItemPrices(items);

    const cart = await Cart.findOneAndUpdate(
      { user: req.session.user.id },
      { user: req.session.user.id, items: pricedItems },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, cart: cartItemsToJson(cart.items) });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const incoming = normalizeIncomingItem(req.body);
    if (!incoming) {
      return res.status(400).json({ success: false, message: "Invalid product." });
    }

    const cart = await getOrCreateCart(req.session.user.id);
    const key = incoming.product + "|" + incoming.size;
    const existing = cart.items.find((item) => String(item.product) + "|" + String(item.size) === key);

    if (existing) {
      existing.quantity += incoming.quantity;
    } else {
      cart.items.push(incoming);
    }

    cart.items = await refreshCartItemPrices(cart.items);
    await cart.save();

    res.json({ success: true, cart: cartItemsToJson(cart.items) });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId, size } = req.body;
    const cart = await getOrCreateCart(req.session.user.id);
    const sizeKey = size != null ? String(size) : "—";

    cart.items = cart.items.filter((item) => {
      const matchProduct = String(item.product) === String(productId);
      const matchSize = String(item.size || "—") === sizeKey;
      return !(matchProduct && matchSize);
    });

    await cart.save();
    res.json({ success: true, cart: cartItemsToJson(cart.items) });
  } catch (err) {
    next(err);
  }
};

exports.updateQuantity = async (req, res, next) => {
  try {
    const { productId, size, qty } = req.body;
    const cart = await getOrCreateCart(req.session.user.id);
    const sizeKey = size != null ? String(size) : "—";
    const item = cart.items.find(
      (i) => String(i.product) === String(productId) && String(i.size || "—") === sizeKey
    );
    if (item) {
      item.quantity = Math.max(1, Number(qty) || 1);
      await cart.save();
    }
    res.json({ success: true, cart: cartItemsToJson(cart.items) });
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.session.user.id);
    cart.items = [];
    await cart.save();
    res.json({ success: true, cart: [] });
  } catch (err) {
    next(err);
  }
};
