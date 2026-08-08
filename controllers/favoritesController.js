const mongoose = require("mongoose");
const User = require("../models/User");

function favoritesToJson(user) {
  return (user.favorites || []).map((id) => String(id));
}

exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user.id).select("favorites");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, favorites: favoritesToJson(user) });
  } catch (err) {
    next(err);
  }
};

exports.syncFavorites = async (req, res, next) => {
  try {
    const incoming = Array.isArray(req.body.favorites) ? req.body.favorites : [];
    const valid = incoming.filter((id) => mongoose.Types.ObjectId.isValid(String(id)));

    const user = await User.findById(req.session.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const merged = new Set(user.favorites.map(String));
    valid.forEach((id) => merged.add(String(id)));
    user.favorites = Array.from(merged);
    await user.save();

    res.json({ success: true, favorites: favoritesToJson(user) });
  } catch (err) {
    next(err);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId || !mongoose.Types.ObjectId.isValid(String(productId))) {
      return res.status(400).json({ success: false, message: "Invalid product." });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const idStr = String(productId);
    const idx = user.favorites.findIndex((f) => String(f) === idStr);

    if (idx >= 0) {
      user.favorites.splice(idx, 1);
    } else {
      user.favorites.push(productId);
    }

    await user.save();
    res.json({ success: true, added: idx < 0, favorites: favoritesToJson(user) });
  } catch (err) {
    next(err);
  }
};

/* Returns fully populated favorite product details, for rendering the favorites page */
exports.getFavoriteProducts = async (req, res, next) => {
  try {
    const productController = require("./productController");
    const user = await User.findById(req.session.user.id).populate({
      path: "favorites",
      match: { isHidden: { $ne: true } }
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.json({
      success: true,
      products: user.favorites.map(productController.formatProductForStorefront)
    });
  } catch (err) {
    next(err);
  }
};
