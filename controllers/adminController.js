const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const PromoCode = require("../models/PromoCode");

function handleAdminError(req, res, next, errorRedirect, err) {
  if (!err) return res.redirect(errorRedirect);

  const mongoDisconnected =
    err.name === "MongoNotConnectedError" ||
    err.name === "MongooseServerSelectionError" ||
    /not connected|ECONNREFUSED|ETIMEOUT/i.test(String(err.message || ""));

  if (mongoDisconnected) {
    req.session.error = "Database is not connected. Wait a moment and try again.";
    return res.redirect(errorRedirect);
  }

  if (err.name === "ValidationError") {
    const messages = err.errors ? Object.values(err.errors).map((e) => e.message).join(" ") : err.message;
    req.session.error = messages || "Validation failed.";
    return res.redirect(errorRedirect);
  }

  if (err.code === 11000) {
    req.session.error = "That value already exists (duplicate key).";
    return res.redirect(errorRedirect);
  }

  req.session.error = err.message || "Something went wrong.";
  return res.redirect(errorRedirect);
}

function parseSizes(body) {
  const sizes = [];
  if (!body.sizes) return sizes;

  const raw = Array.isArray(body.sizes) ? body.sizes : Object.values(body.sizes);

  raw.forEach((row) => {
    if (!row || !row.size) return;
    sizes.push({
      size: String(row.size).toUpperCase().trim(),
      price: Number(row.price) || 0,
      stock: row.stock != null && row.stock !== "" ? Number(row.stock) : 0
    });
  });

  return sizes;
}

function normalizeProductBody(body, file, oldImage) {
  const image = file ? "/uploads/" + file.filename : (oldImage || body.imageUrl || "").trim();
  const category = String(body.category || "").toLowerCase().trim();
  const type = String(body.type || "apparel").toLowerCase().trim();

  if (!body.name || !category || !image) {
    throw new Error("Name, category, and image are required.");
  }

  const sizes = parseSizes(body);
  const stock = sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);

  return {
    name: String(body.name).trim(),
    description: String(body.description || "").trim(),
    line: String(body.line || "").trim(),
    category,
    type,
    image,
    currency: String(body.currency || "LE").trim() || "LE",
    sizes,
    stock,
    isFeatured: body.isFeatured === "on" || body.isFeatured === "true",
    isBestSeller: body.isBestSeller === "on" || body.isBestSeller === "true",
    isFlashSale: body.isFlashSale === "on" || body.isFlashSale === "true"
  };
}

exports.requireDb = (req, res, next) => next();

/* ============ DASHBOARD ============ */
exports.getDashboard = async (req, res, next) => {
  try {
    const [productCount, orderCount, userCount, pendingOrders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.countDocuments({ status: "pending" })
    ]);

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email");

    res.render("admin/dashboard", {
      title: "Admin dashboard · Sportify",
      activePage: "admin",
      stats: { productCount, orderCount, userCount, pendingOrders },
      recentOrders
    });
  } catch (err) {
    next(err);
  }
};

/* ============ PRODUCTS ============ */
exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 10;
    const total = await Product.countDocuments();
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.render("admin/products", {
      title: "Manage products · Sportify Admin",
      activePage: "admin",
      products,
      page,
      pages: Math.max(1, Math.ceil(total / limit))
    });
  } catch (err) {
    next(err);
  }
};

exports.getAddProduct = (req, res) => {
  res.render("admin/productForm", {
    title: "Add product · Sportify Admin",
    activePage: "admin",
    product: null,
    mode: "add"
  });
};

exports.postAddProduct = async (req, res, next) => {
  try {
    const payload = normalizeProductBody(req.body, req.file);
    await Product.create(payload);
    req.session.success = "Product created successfully.";
    res.redirect("/admin/products");
  } catch (err) {
    handleAdminError(req, res, next, "/admin/products/new", err);
  }
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.session.error = "Product not found.";
      return res.redirect("/admin/products");
    }
    res.render("admin/productForm", {
      title: "Edit product · Sportify Admin",
      activePage: "admin",
      product,
      mode: "edit"
    });
  } catch (err) {
    next(err);
  }
};

exports.putEditProduct = async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      req.session.error = "Product not found.";
      return res.redirect("/admin/products");
    }

    const payload = normalizeProductBody(req.body, req.file, existing.image);

    if (req.file && existing.image && existing.image.startsWith("/uploads/")) {
      const oldPath = path.join(__dirname, "..", "public", existing.image);
      fs.unlink(oldPath, () => {});
    }

    await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    req.session.success = "Product updated successfully.";
    res.redirect("/admin/products");
  } catch (err) {
    handleAdminError(req, res, next, `/admin/products/${req.params.id}/edit`, err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product && product.image && product.image.startsWith("/uploads/")) {
      const imgPath = path.join(__dirname, "..", "public", product.image);
      fs.unlink(imgPath, () => {});
    }
    req.session.success = "Product deleted successfully.";
    res.redirect("/admin/products");
  } catch (err) {
    handleAdminError(req, res, next, "/admin/products", err);
  }
};

exports.toggleProductHidden = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.session.error = "Product not found.";
      return res.redirect("/admin/products");
    }
    product.isHidden = !product.isHidden;
    await product.save();
    req.session.success = product.isHidden ? "Product hidden from storefront." : "Product is now visible.";
    res.redirect("/admin/products");
  } catch (err) {
    handleAdminError(req, res, next, "/admin/products", err);
  }
};

/* ============ ORDERS ============ */
exports.getOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 10;
    const total = await Order.countDocuments();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name email");

    res.render("admin/orders", {
      title: "Manage orders · Sportify Admin",
      activePage: "admin",
      orders,
      page,
      pages: Math.max(1, Math.ceil(total / limit))
    });
  } catch (err) {
    next(err);
  }
};

exports.getEditOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      req.session.error = "Order not found.";
      return res.redirect("/admin/orders");
    }
    res.render("admin/orderForm", {
      title: "Edit order · Sportify Admin",
      activePage: "admin",
      order
    });
  } catch (err) {
    next(err);
  }
};

exports.putEditOrder = async (req, res, next) => {
  try {
    const { status, customerName, customerEmail, phone, shippingAddress } = req.body;
    await Order.findByIdAndUpdate(
      req.params.id,
      { status, customerName, customerEmail, phone, shippingAddress },
      { runValidators: true }
    );
    req.session.success = "Order updated successfully.";
    res.redirect("/admin/orders");
  } catch (err) {
    handleAdminError(req, res, next, `/admin/orders/${req.params.id}/edit`, err);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    req.session.success = "Order deleted.";
    res.redirect("/admin/orders");
  } catch (err) {
    handleAdminError(req, res, next, "/admin/orders", err);
  }
};

/* ============ PROMO CODES (super admin) ============ */
exports.getPromos = async (req, res, next) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.render("admin/promos", {
      title: "Promo codes · Sportify Admin",
      activePage: "admin",
      promos
    });
  } catch (err) {
    next(err);
  }
};

exports.getAddPromo = (req, res) => {
  res.render("admin/promoForm", { title: "Add promo code · Sportify Admin", activePage: "admin", promo: null });
};

exports.postAddPromo = async (req, res, next) => {
  try {
    const { code, discountPercent, active } = req.body;
    await PromoCode.create({ code, discountPercent: Number(discountPercent), active: active === "on" });
    req.session.success = "Promo code created.";
    res.redirect("/admin/promos");
  } catch (err) {
    handleAdminError(req, res, next, "/admin/promos/new", err);
  }
};

exports.getEditPromo = async (req, res, next) => {
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) {
      req.session.error = "Promo code not found.";
      return res.redirect("/admin/promos");
    }
    res.render("admin/promoForm", { title: "Edit promo code · Sportify Admin", activePage: "admin", promo });
  } catch (err) {
    next(err);
  }
};

exports.putEditPromo = async (req, res, next) => {
  try {
    const { code, discountPercent, active } = req.body;
    await PromoCode.findByIdAndUpdate(
      req.params.id,
      { code, discountPercent: Number(discountPercent), active: active === "on" },
      { runValidators: true }
    );
    req.session.success = "Promo code updated.";
    res.redirect("/admin/promos");
  } catch (err) {
    handleAdminError(req, res, next, `/admin/promos/${req.params.id}/edit`, err);
  }
};

exports.deletePromo = async (req, res, next) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    req.session.success = "Promo code deleted.";
    res.redirect("/admin/promos");
  } catch (err) {
    handleAdminError(req, res, next, "/admin/promos", err);
  }
};

/* ============ USERS (super admin) ============ */
exports.getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 10;
    const total = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.render("admin/users", {
      title: "Manage users · Sportify Admin",
      activePage: "admin",
      users,
      page,
      pages: Math.max(1, Math.ceil(total / limit))
    });
  } catch (err) {
    next(err);
  }
};

exports.getAddUser = (req, res) => {
  res.render("admin/userForm", { title: "Add staff account · Sportify Admin", activePage: "admin", targetUser: null });
};

exports.postAddUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 12);
    await User.create({ name, email: email.toLowerCase(), password: hashed, role: role || "user" });
    req.session.success = "User created successfully.";
    res.redirect("/admin/users");
  } catch (err) {
    handleAdminError(req, res, next, "/admin/users/new", err);
  }
};

exports.getEditUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      req.session.error = "User not found.";
      return res.redirect("/admin/users");
    }
    res.render("admin/userForm", { title: "Edit user · Sportify Admin", activePage: "admin", targetUser });
  } catch (err) {
    next(err);
  }
};

exports.putEditUser = async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body;
    const update = { name, email: email.toLowerCase(), role };
    if (password) {
      update.password = await bcrypt.hash(password, 12);
    }
    await User.findByIdAndUpdate(req.params.id, update, { runValidators: true });
    req.session.success = "User updated successfully.";
    res.redirect("/admin/users");
  } catch (err) {
    handleAdminError(req, res, next, `/admin/users/${req.params.id}/edit`, err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.session.user.id)) {
      req.session.error = "You cannot delete your own account.";
      return res.redirect("/admin/users");
    }
    await User.findByIdAndDelete(req.params.id);
    req.session.success = "User deleted.";
    res.redirect("/admin/users");
  } catch (err) {
    handleAdminError(req, res, next, "/admin/users", err);
  }
};
