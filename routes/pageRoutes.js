const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");
const { requireLogin } = require("../middleware/authMiddleware");

router.get("/", pageController.getHome);
router.get("/about", pageController.getAbout);
router.get("/shop", pageController.getShop);
router.get("/favorites", requireLogin, pageController.getFavoritesPage);
router.get("/profile", requireLogin, pageController.getProfile);
router.post("/profile", requireLogin, pageController.postProfile);

module.exports = router;
