const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireGuest } = require("../middleware/authMiddleware");
const { validateLogin, validateSignup } = require("../middleware/validationMiddleware");

router.get("/", authController.getAuthEntry);
router.get("/login", requireGuest, authController.getLogin);
router.get("/signup", requireGuest, authController.getSignup);
router.post("/login", requireGuest, validateLogin, authController.postLogin);
router.post("/signup", requireGuest, validateSignup, authController.postSignup);
router.get("/logout", authController.logout);

module.exports = router;
