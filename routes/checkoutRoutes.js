const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkoutController");
const { requireLogin } = require("../middleware/authMiddleware");
const { validateCheckout } = require("../middleware/validationMiddleware");

router.get("/", requireLogin, checkoutController.getCheckout);
router.post("/", requireLogin, validateCheckout, checkoutController.placeOrder);
router.get("/thanks", requireLogin, checkoutController.getThanks);

module.exports = router;