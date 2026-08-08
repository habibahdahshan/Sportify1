const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { requireAdmin } = require("../middleware/authMiddleware");

router.get("/", requireAdmin, productController.getAllProducts);
router.get("/:id", productController.getProductDetails);

module.exports = router;
