const PromoCode = require("../models/PromoCode");

function normalizeCode(raw) {
  return String(raw || "")
    .replace(/[\s\u200b-\u200d\ufeff\u00a0]/g, "")
    .toUpperCase();
}

exports.validatePromoCode = async (req, res, next) => {
  try {
    const code = normalizeCode(req.params.code || req.query.code);
    if (!code) {
      return res.status(400).json({ success: false, message: "Code is required." });
    }

    const promo = await PromoCode.findOne({ code, active: true });
    if (!promo) {
      return res.status(404).json({ success: false, message: "Invalid or inactive promo code." });
    }

    res.json({ success: true, code: promo.code, discountPercent: promo.discountPercent });
  } catch (err) {
    next(err);
  }
};

exports.lookupActivePromo = async function lookupActivePromo(code) {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  const promo = await PromoCode.findOne({ code: normalized, active: true });
  if (!promo) return null;
  return { code: promo.code, discountPercent: promo.discountPercent };
};
