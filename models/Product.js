const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    line: {
      type: String,
      trim: true,
      default: ""
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      lowercase: true,
      trim: true,
      enum: ["men", "women", "unisex"]
    },

    type: {
      type: String,
      lowercase: true,
      trim: true,
      enum: ["apparel", "footwear", "accessories"],
      default: "apparel"
    },

    image: {
      type: String,
      required: [true, "Product image is required"],
      trim: true
    },

    currency: {
      type: String,
      trim: true,
      default: "LE"
    },

    sizes: [
      {
        size: {
          type: String,
          required: true,
          trim: true,
          uppercase: true
        },
        price: {
          type: Number,
          required: true,
          min: 0
        },
        stock: {
          type: Number,
          min: 0,
          default: 0
        }
      }
    ],

    stock: {
      type: Number,
      default: 0,
      min: 0
    },

    isFeatured: {
      type: Boolean,
      default: false
    },

    isBestSeller: {
      type: Boolean,
      default: false
    },

    isFlashSale: {
      type: Boolean,
      default: false
    },

    isHidden: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

productSchema.pre("validate", function (next) {
  if (Array.isArray(this.sizes) && this.sizes.length) {
    this.stock = this.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
