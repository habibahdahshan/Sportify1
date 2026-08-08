const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favoritesController");
const { requireLoginApi } = require("../middleware/authMiddleware");

router.get("/", requireLoginApi, favoritesController.getFavorites);
router.get("/products", requireLoginApi, favoritesController.getFavoriteProducts);
router.post("/sync", requireLoginApi, favoritesController.syncFavorites);
router.post("/toggle", requireLoginApi, favoritesController.toggleFavorite);

module.exports = router;
