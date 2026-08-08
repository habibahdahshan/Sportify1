const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cart user is required"],
      unique: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        name: { type: String, trim: true, default: "" },
        price: { type: Number, min: 0, default: 0 },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
          default: 1
        },
        size: { type: String, default: "—" },
        image: { type: String, default: "" },
        currency: { type: String, default: "LE" },
        originalPrice: { type: Number, min: 0, default: 0 },
        isFlashSale: { type: Boolean, default: false }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Cart", cartSchema);
