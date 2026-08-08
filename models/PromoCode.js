const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Promo code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [2, "Code must be at least 2 characters"]
    },
    discountPercent: {
      type: Number,
      required: [true, "Discount percent is required"],
      min: [1, "Minimum discount is 1%"],
      max: [100, "Maximum discount is 100%"]
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PromoCode", promoCodeSchema);
