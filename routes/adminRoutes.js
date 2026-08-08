const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const upload = require("../middleware/upload");
const asyncHandler = require("../middleware/asyncHandler");
const { requireAdmin, requireSuperAdmin } = require("../middleware/authMiddleware");
const { validateProduct } = require("../middleware/validationMiddleware");

const wrap = (fn) => asyncHandler(fn);

router.use(requireAdmin, adminController.requireDb);

router.get("/", wrap(adminController.getDashboard));

/* Products */
router.get("/products", wrap(adminController.getProducts));
router.get("/products/new", wrap(adminController.getAddProduct));
router.post("/products", upload.single("image"), validateProduct, wrap(adminController.postAddProduct));
router.get("/products/:id/edit", wrap(adminController.getEditProduct));
router.post("/products/:id/update", upload.single("image"), wrap(adminController.putEditProduct));
router.post("/products/:id/delete", wrap(adminController.deleteProduct));
router.post("/products/:id/toggle-hidden", wrap(adminController.toggleProductHidden));

/* Orders */
router.get("/orders", wrap(adminController.getOrders));
router.get("/orders/:id/edit", wrap(adminController.getEditOrder));
router.post("/orders/:id/update", wrap(adminController.putEditOrder));
router.post("/orders/:id/delete", wrap(adminController.deleteOrder));

/* Promo codes (super admin) */
router.get("/promos", requireSuperAdmin, wrap(adminController.getPromos));
router.get("/promos/new", requireSuperAdmin, wrap(adminController.getAddPromo));
router.post("/promos", requireSuperAdmin, wrap(adminController.postAddPromo));
router.get("/promos/:id/edit", requireSuperAdmin, wrap(adminController.getEditPromo));
router.post("/promos/:id/update", requireSuperAdmin, wrap(adminController.putEditPromo));
router.post("/promos/:id/delete", requireSuperAdmin, wrap(adminController.deletePromo));

/* Users (super admin) */
router.get("/users", requireSuperAdmin, wrap(adminController.getUsers));
router.get("/users/new", requireSuperAdmin, wrap(adminController.getAddUser));
router.post("/users", requireSuperAdmin, wrap(adminController.postAddUser));
router.get("/users/:id/edit", requireSuperAdmin, wrap(adminController.getEditUser));
router.post("/users/:id/update", requireSuperAdmin, wrap(adminController.putEditUser));
router.post("/users/:id/delete", requireSuperAdmin, wrap(adminController.deleteUser));

module.exports = router;
