const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { requireLogin, requireAdmin } = require("../middleware/authMiddleware");

router.get("/my-orders", requireLogin, orderController.getMyOrders);
router.put("/:id", requireAdmin, orderController.updateOrderStatus);
router.delete("/:id", requireAdmin, orderController.deleteOrder);

module.exports = router;
