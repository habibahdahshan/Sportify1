const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { requireLoginApi } = require("../middleware/authMiddleware");

router.get("/", requireLoginApi, cartController.getCart);
router.post("/sync", requireLoginApi, cartController.syncCart);
router.post("/add", requireLoginApi, cartController.addToCart);
router.post("/update", requireLoginApi, cartController.updateQuantity);
router.post("/remove", requireLoginApi, cartController.removeFromCart);
router.post("/clear", requireLoginApi, cartController.clearCart);

module.exports = router;