const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const productController = require("./productController");
const { lookupActivePromo } = require("./promoController");

function livePriceFromProduct(product, size) {
  const formatted = productController.formatProductForStorefront(product);
  const sizes = formatted.sizes || [];
  const match =
    sizes.find((s) => String(s.size).toUpperCase() === String(size).toUpperCase()) ||
    sizes.find((s) => s.size === formatted.baseSize) ||
    sizes[0];
  return match && match.price != null ? Number(match.price) : 0;
}

function parseCartFromBody(body) {
  if (body && body.cartItems) {
    try {
      const parsed = JSON.parse(body.cartItems);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      /* ignore invalid JSON */
    }
  }
  return [];
}

exports.getCheckout = (req, res) => {
  res.render("pages/checkout", {
    title: "Checkout · Sportify",
    activePage: "checkout"
  });
};

exports.placeOrder = async (req, res, next) => {
  try {
    const rawAddress = req.body.address ?? req.body.shippingAddress ?? req.body.shipping_address ?? "";
    const { name, email, phone, paymentMethod, promoCode } = req.body;
    const address = String(rawAddress).trim();
    const cart = parseCartFromBody(req.body);

    if (cart.length === 0) {
      req.session.error = "Cart is empty.";
      return res.redirect("/checkout");
    }

    let totalPrice = 0;
    const lineItems = [];

    for (const item of cart) {
      const qty = Math.max(1, Number(item.qty || item.quantity) || 1);
      const pid = item.productId ? String(item.productId) : "";
      let price = Number(item.price) || 0;

      if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
        req.session.error = "Invalid item in cart. Please remove it and try again.";
        return res.redirect("/checkout");
      }

      const product = await Product.findById(pid);
      if (!product) {
        req.session.error = `An item in your cart ("${item.name}") no longer exists. Please remove it.`;
        return res.redirect("/checkout");
      }
      if (product.isHidden) {
        req.session.error = `"${product.name}" is no longer available. Please remove it from your cart.`;
        return res.redirect("/checkout");
      }

      price = livePriceFromProduct(product, item.size);

      const selectedSize = Array.isArray(product.sizes)
        ? product.sizes.find((s) => String(s.size).toUpperCase() === String(item.size).toUpperCase())
        : null;

      if (!selectedSize || selectedSize.stock < qty) {
        req.session.error = `Not enough stock for ${product.name} (size ${item.size}).`;
        return res.redirect("/checkout");
      }

      lineItems.push({
        productId: pid,
        name: product.name,
        price,
        quantity: qty,
        size: item.size != null ? String(item.size) : "",
        image: product.image || "",
        currency: product.currency || "LE"
      });

      totalPrice += price * qty;
    }

    let appliedPromo = "";
    let discountPercent = 0;
    const promo = await lookupActivePromo(promoCode);
    if (promo) {
      appliedPromo = promo.code;
      discountPercent = promo.discountPercent;
      totalPrice = totalPrice * (1 - discountPercent / 100);
    }

    await Order.create({
      user: req.session.user.id,
      lineItems,
      customerName: name,
      customerEmail: email,
      phone,
      shippingAddress: address,
      paymentMethod: paymentMethod || "cash",
      totalPrice: Math.round(totalPrice * 100) / 100,
      promoCode: appliedPromo,
      discountPercent,
      status: "pending"
    });

    // Decrement stock for each purchased size
    for (const item of lineItems) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const size = product.sizes.find((s) => String(s.size).toUpperCase() === String(item.size).toUpperCase());
      if (size) {
        size.stock = Math.max(0, (size.stock || 0) - item.quantity);
      }
      product.stock = product.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
      product.markModified("sizes");
      await product.save();
    }

    await Cart.findOneAndUpdate({ user: req.session.user.id }, { items: [] }, { upsert: true });

    req.session.success = "Order placed successfully.";
    res.redirect("/checkout/thanks");
  } catch (err) {
    next(err);
  }
};

exports.getThanks = (req, res) => {
  res.render("pages/thankyou", {
    title: "Thank you · Sportify"
  });
};
