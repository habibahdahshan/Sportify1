require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const methodOverride = require("method-override");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

/* =========================
   DATABASE CONNECTION
========================= */

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sportify")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err.message));

/* =========================
   VIEW ENGINE
========================= */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* =========================
   TRUST PROXY / HTTPS (for deployment behind Render, Railway, Heroku, Nginx, etc.)
========================= */

if (isProduction) {
  app.set("trust proxy", 1);
}

if (process.env.FORCE_HTTPS === "true") {
  app.use((req, res, next) => {
    if (req.secure || req.headers["x-forwarded-proto"] === "https") {
      return next();
    }
    return res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  });
}

/* =========================
   MIDDLEWARE (before routes)
========================= */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use((req, res, next) => {
  const override = (req.body && req.body._method) || (req.query && req.query._method);
  if (override) {
    req.method = String(override).toUpperCase();
  }
  next();
});

if (!process.env.SESSION_SECRET && isProduction) {
  console.warn("Warning: SESSION_SECRET is not set. Set it in production for secure sessions.");
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "sportify_dev_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sportify",
      touchAfter: 24 * 3600
    })
  })
);

/* Locals available in every view: session user, flash messages */
app.use((req, res, next) => {
  const sessionUser = req.session.user || null;
  res.locals.user = sessionUser;
  res.locals.isSuperAdmin = !!(sessionUser && sessionUser.role === "superadmin");
  res.locals.currentUserId = sessionUser ? String(sessionUser.id || sessionUser._id || "") : "";
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;
  delete req.session.success;
  delete req.session.error;
  next();
});

/* Localization (EN/AR) */
app.use(require("./middleware/i18n"));

/* =========================
   ROUTES (before static files)
========================= */

const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const productController = require("./controllers/productController");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");
const externalApiRoutes = require("./routes/externalApiRoutes");
const promoController = require("./controllers/promoController");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

app.use("/", pageRoutes);
app.use("/auth", authRoutes);
app.get("/api/products", productController.getStorefrontProducts);
app.get("/api/promos/validate/:code", promoController.validatePromoCode);
app.use("/products", productRoutes);
app.use("/admin", adminRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/api/external", externalApiRoutes);

/* Static assets after dynamic routes */
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   404 + ERROR HANDLER
========================= */

app.use(notFound);
app.use(errorHandler);

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3001;

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Sportify server running on http://localhost:${PORT}`);
  });
}
