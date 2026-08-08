const express = require("express");
const router = express.Router();
const externalApiController = require("../controllers/externalApiController");

router.get("/currency", externalApiController.getCurrencyRates);
router.get("/info", externalApiController.getExternalInfo);

module.exports = router;
