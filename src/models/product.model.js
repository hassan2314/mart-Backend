import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
export const Product = mongoose.model("Product", productSchema);
